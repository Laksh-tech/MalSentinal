"""
# !/usr/bin/env python3
Lightweight static-analysis feature-acquisition pipeline for Android APKs.

Design rationale (per spec):
    - Androguard's Analysis/AnalyzeAPK path is avoided entirely. Its DEX
      cross-referencing (building a full XREF-annotated CFG/DFG over the
      whole dex) is the dominant cost on large APKs.
    - Decompilation is delegated to `apktool`, which only disassembles
      DEX -> Smali (no cross-referencing pass). This is much cheaper.
    - The API Call Graph (FCG) is *not* built with a bytecode-aware
      library. Instead, smali text files are scanned with a single-pass
      O(N) regex over `invoke-*` instructions. This trades semantic
      precision (e.g. no real virtual-dispatch resolution) for speed.
    - A pruning heuristic then collapses the raw call graph down to the
      subset of nodes/edges that lie on a path to an Android framework
      API sink, which is normally >90% of what a detection model needs
      and a small fraction of the raw node count.

Pipeline stages
----------------
    1. APKValidator      -> hash + structural integrity checks
    2. ApktoolDecompiler  -> APK -> Smali (subprocess wrapper around apktool)
    3. ManifestParser     -> permissions / components / intent-filters
    4. SmaliScanner       -> single-pass regex extraction of:
                                - invoke-* edges (raw call graph)
                                - opcode sequences per method
    5. GraphBuilder       -> Permission Graph, pruned API Call Graph (FCG),
                              Intent Graph
    6. Orchestrator       -> wires the above into one JSON feature report

Usage
-----
    python3 static_data_aquisition.py --apk /path/to/app.apk \
        --output ./out --apktool /path/to/apktool[.jar]

    # keep the decompiled smali tree around for inspection
    python3 static_data_aquisition.py --apk app.apk --output ./out --keep-decompiled

Requirements
------------
    - Python 3.8+
    - `apktool` available on PATH (or pass --apktool-path to a wrapper
      script / jar; if a .jar is given it is invoked as `java -jar ...`)

This file has no third-party dependencies (stdlib only) so it can run in
constrained CI / sandbox environments.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
import re
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict, deque
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from validator import APKValidator
from decompiler import ApktoolDecompiler
from manifest import ManifestParser
from smali_scanner import SmaliScanner
from api_graph import APICallGraphBuilder
from permission_graph import PermissionGraphBuilder
from intent_graph import IntentGraphBuilder
from utils import logger 

def _setup_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="[%(asctime)s] %(levelname)-7s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )



# --------------------------------------------------------------------------- #
# Orchestrator
# --------------------------------------------------------------------------- #

class StaticAcquisitionPipeline:
    def __init__(
        self,
        apk_path: Path,
        output_dir: Path,
        apktool_path: str = "apktool",
        keep_decompiled: bool = False,
        no_res: bool = True,
        apktool_timeout_s: int = 600,
    ):
        self.apk_path = apk_path
        self.output_dir = output_dir
        self.apktool_path = apktool_path
        self.keep_decompiled = keep_decompiled
        self.no_res = no_res
        self.apktool_timeout_s = apktool_timeout_s

    def run(self) -> Dict[str, object]:
        t_start = time.time()
        self.output_dir.mkdir(parents=True, exist_ok=True)
        decompile_dir = self.output_dir / "decompiled"

        # 1. Validate
        validator = APKValidator(self.apk_path)
        validation = validator.validate()
        if not validation.is_valid:
            return {
                "apk": str(self.apk_path),
                "validation": vars(validation),
                "status": "REJECTED",
            }
        logger.info("Validation OK — sha256=%s size=%d bytes", validation.sha256, validation.size_bytes)

        # 2. Decompile
        decompiler = ApktoolDecompiler(apktool_path=self.apktool_path, timeout_s=self.apktool_timeout_s)
        decompiler.decompile(self.apk_path, decompile_dir, no_res=self.no_res)

        # 3. Manifest
        manifest_info = ManifestParser(decompile_dir / "AndroidManifest.xml").parse()
        logger.info(
            "Manifest parsed — package=%s, %d permissions, %d components",
            manifest_info.package,
            len(manifest_info.requested_permissions),
            len(manifest_info.components),
        )

        # 4. Smali scan
        scan_result = SmaliScanner().scan(decompile_dir)
        logger.info(
            "Smali scan complete — %d files, %d classes, %d methods, %d invoke edges",
            scan_result.smali_files_scanned,
            scan_result.class_count,
            scan_result.method_count,
            len(scan_result.call_edges),
        )

        # 5. Graphs
        fcg = APICallGraphBuilder(scan_result.call_edges).build_pruned_fcg()
        permission_graph = PermissionGraphBuilder(
            manifest_info.requested_permissions, scan_result.call_edges
        ).build()
        intent_graph = IntentGraphBuilder(manifest_info.components).build()

        elapsed = time.time() - t_start
        report = {
            "apk": str(self.apk_path),
            "status": "OK",
            "elapsed_seconds": round(elapsed, 2),
            "validation": {
                "sha256": validation.sha256,
                "md5": validation.md5,
                "size_bytes": validation.size_bytes,
                "dex_files": validation.dex_files,
            },
            "manifest": {
                "package": manifest_info.package,
                "min_sdk": manifest_info.min_sdk,
                "target_sdk": manifest_info.target_sdk,
                "requested_permissions": manifest_info.requested_permissions,
                "components": [vars(c) for c in manifest_info.components],
            },
            "permission_graph": permission_graph,
            "api_call_graph": fcg,
            "intent_graph": intent_graph,
            "opcode_features": {
                "method_count": scan_result.method_count,
                "class_count": scan_result.class_count,
                "smali_files_scanned": scan_result.smali_files_scanned,
                # Cap the payload: full per-method opcode sequences can be
                # large, so only the first N are embedded inline and the
                # rest are written to a companion file.
                "sample_sequences": dict(list(scan_result.opcode_sequences.items())[:25]),
            },
        }

        # Full opcode sequence dump goes to a side file, not inline in the
        # main report, to keep the primary JSON readable.
        opcode_dump_path = self.output_dir / "opcode_sequences.json"
        with open(opcode_dump_path, "w", encoding="utf-8") as fh:
            json.dump(scan_result.opcode_sequences, fh, indent=2)
        report["opcode_features"]["full_dump_path"] = str(opcode_dump_path)

        report_path = self.output_dir / "static_features.json"
        with open(report_path, "w", encoding="utf-8") as fh:
            json.dump(report, fh, indent=2)
        report["report_path"] = str(report_path)

        if not self.keep_decompiled:
            shutil.rmtree(decompile_dir, ignore_errors=True)
            logger.info("Removed decompiled smali tree (pass --keep-decompiled to retain it)")

        logger.info("Pipeline finished in %.2fs -> %s", elapsed, report_path)
        return report

# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Lightweight Apktool + regex based static feature acquisition for APKs "
        "(Androguard-free — avoids AnalyzeAPK's DEX cross-referencing cost)."
    )
    parser.add_argument("--apk", required=True, type=Path, help="Path to the input .apk file")
    parser.add_argument(
        "--output", required=True, type=Path, help="Output directory for the feature report"
    )
    parser.add_argument(
        "--apktool-path",
        default="apktool",
        help="apktool executable or .jar path (default: 'apktool' on PATH)",
    )
    parser.add_argument(
        "--keep-decompiled",
        action="store_true",
        help="Keep the decompiled smali tree instead of deleting it after the scan",
    )
    parser.add_argument(
        "--with-resources",
        action="store_true",
        help="Also decode resources with apktool (slower; not needed for manifest/smali features)",
    )
    parser.add_argument(
        "--apktool-timeout",
        type=int,
        default=600,
        help="Timeout in seconds for the apktool subprocess (default: 600)",
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable debug logging")
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = build_arg_parser().parse_args(argv)
    _setup_logging(args.verbose)

    pipeline = StaticAcquisitionPipeline(
        apk_path=args.apk,
        output_dir=args.output,
        apktool_path=args.apktool_path,
        keep_decompiled=args.keep_decompiled,
        no_res=not args.with_resources,
        apktool_timeout_s=args.apktool_timeout,
    )

    try:
        report = pipeline.run()
    except RuntimeError as exc:
        logger.error(str(exc))
        return 1

    if report.get("status") != "OK":
        logger.error("APK rejected: %s", report.get("validation", {}).get("errors"))
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
