from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
from utils import logger , CLASS_DEF_RE, METHOD_DEF_RE,METHOD_END_RE,INVOKE_RE,OPCODE_RE
# --------------------------------------------------------------------------- #
# Stage 4: Smali scanner (O(N) single pass regex, no bytecode parsing lib)
# --------------------------------------------------------------------------- #

@dataclass
class CallEdge:
    caller: str  # "Lcom/foo/Bar;->baz(I)V"
    callee: str  # "Landroid/util/Log;->d(...)"


@dataclass
class ScanResult:
    call_edges: List[CallEdge] = field(default_factory=list)
    opcode_sequences: Dict[str, List[str]] = field(default_factory=dict)
    method_count: int = 0
    class_count: int = 0
    smali_files_scanned: int = 0


class SmaliScanner:
    """
    Single pass over every .smali file. For each method body we track:
      - the fully-qualified caller signature
      - every invoke-* target found inside it (-> call graph edges)
      - the ordered opcode mnemonic sequence (-> opcode features)

    This intentionally does not attempt virtual-dispatch resolution,
    constant propagation, or any dataflow analysis - it is a structural /
    lexical scan, which is what keeps it O(N) in file size.
    """

    def scan(self, smali_root: Path) -> ScanResult:
        result = ScanResult()
        smali_dirs = [p for p in smali_root.glob("smali*") if p.is_dir()]
        if not smali_dirs:
            # apktool sometimes just emits "smali" — fall back to the root
            smali_dirs = [smali_root]

        for smali_dir in smali_dirs:
            for smali_file in smali_dir.rglob("*.smali"):
                self._scan_file(smali_file, result)
                result.smali_files_scanned += 1

        return result

    def _scan_file(self, path: Path, result: ScanResult) -> None:
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError as exc:
            logger.debug("Skipping unreadable file %s: %s", path, exc)
            return

        current_class: Optional[str] = None
        current_method_sig: Optional[str] = None
        current_opcodes: List[str] = []

        for line in text.splitlines():
            cls_match = CLASS_DEF_RE.match(line)
            if cls_match:
                current_class = cls_match.group("cls")
                result.class_count += 1
                continue

            if current_class is None:
                continue

            method_match = METHOD_DEF_RE.match(line)
            if method_match:
                current_method_sig = (
                    f"{current_class}->{method_match.group('name')}"
                    f"({method_match.group('params')}){method_match.group('ret')}"
                )
                current_opcodes = []
                result.method_count += 1
                continue

            if METHOD_END_RE.match(line):
                if current_method_sig is not None:
                    result.opcode_sequences[current_method_sig] = current_opcodes
                current_method_sig = None
                current_opcodes = []
                continue

            if current_method_sig is None:
                continue

            invoke_match = INVOKE_RE.match(line)
            if invoke_match:
                result.call_edges.append(
                    CallEdge(caller=current_method_sig, callee=invoke_match.group("target"))
                )
                current_opcodes.append("invoke-" + invoke_match.group("kind"))
                continue

            opcode_match = OPCODE_RE.match(line)
            if opcode_match:
                current_opcodes.append(opcode_match.group(1))

