from __future__ import annotations

import shutil
import subprocess
import time
from pathlib import Path
from typing import List
from utils import logger
# --------------------------------------------------------------------------- #
# Stage 2: Apktool decompiler wrapper
# --------------------------------------------------------------------------- #

class ApktoolDecompiler:
    """
    Thin subprocess wrapper around apktool. Deliberately does *not* use
    Androguard's AnalyzeAPK - apktool only disassembles to smali, it does
    not build a cross-referenced analysis object, which is where
    Androguard spends most of its time on large APKs.
    """

    def __init__(self, apktool_path: str = "apktool", timeout_s: int = 600):
        self.apktool_path = apktool_path
        self.timeout_s = timeout_s

    def _build_command(self, apk_path: Path, out_dir: Path, no_res: bool) -> List[str]:
        if self.apktool_path.endswith(".jar"):
            base = ["java", "-jar", self.apktool_path]
        else:
            base = [self.apktool_path]

        # Build command as: <base> d [options]
        # Ensure flags like '-r' (apktool's "no-res" flag) are placed
        # after the 'd' subcommand so they are passed to apktool rather
        # than being interpreted by the JVM (when using java -jar).
        cmd = base + ["d"]

        opts: List[str] = ["-f", "-o", str(out_dir), str(apk_path)]
        if no_res:
            # Skip resource decoding for speed; AndroidManifest.xml is still
            # emitted (in modern apktool it's decoded independently of the
            # rest of res/), which is all the ManifestParser stage needs.
            opts.insert(0, "-r")

        cmd += opts
        return cmd

    def decompile(self, apk_path: Path, out_dir: Path, no_res: bool = True) -> Path:
        if out_dir.exists():
            shutil.rmtree(out_dir)

        cmd = self._build_command(apk_path, out_dir, no_res)
        logger.info("Running apktool: %s", " ".join(cmd))

        t0 = time.time()
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout_s,
            )
        except FileNotFoundError as exc:
            raise RuntimeError(
                f"apktool executable not found ('{self.apktool_path}'). "
                "Install apktool or pass --apktool-path."
            ) from exc
        except subprocess.TimeoutExpired as exc:
            raise RuntimeError(f"apktool timed out after {self.timeout_s}s") from exc

        elapsed = time.time() - t0
        logger.info("apktool finished in %.1fs (exit=%s)", elapsed, proc.returncode)

        if proc.returncode != 0:
            raise RuntimeError(
                f"apktool failed (exit {proc.returncode}).\nstdout:\n{proc.stdout}\n"
                f"stderr:\n{proc.stderr}"
            )

        if not out_dir.exists():
            raise RuntimeError("apktool reported success but output dir is missing")

        return out_dir

