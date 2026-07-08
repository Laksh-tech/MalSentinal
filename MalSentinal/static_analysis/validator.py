from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import  List, Optional, Tuple

# --------------------------------------------------------------------------- #
# Stage 1: APK Validator
# --------------------------------------------------------------------------- #

@dataclass
class ValidationResult:
    is_valid: bool
    sha256: Optional[str] = None
    md5: Optional[str] = None
    size_bytes: int = 0
    has_manifest: bool = False
    has_dex: bool = False
    dex_files: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class APKValidator:
    """Cheap structural + hash validation. No decompilation happens here."""

    def __init__(self, apk_path: Path):
        self.apk_path = apk_path

    def validate(self) -> ValidationResult:
        result = ValidationResult(is_valid=False)

        if not self.apk_path.exists():
            result.errors.append(f"APK not found: {self.apk_path}")
            return result

        result.size_bytes = self.apk_path.stat().st_size
        result.sha256, result.md5 = self._hash_file()

        try:
            with zipfile.ZipFile(self.apk_path) as zf:
                bad_entry = zf.testzip()
                if bad_entry is not None:
                    result.errors.append(f"Corrupt zip entry: {bad_entry}")
                    return result

                names = zf.namelist()
                result.has_manifest = "AndroidManifest.xml" in names
                result.dex_files = sorted(n for n in names if re.match(r"^classes\d*\.dex$", n))
                result.has_dex = len(result.dex_files) > 0

                if not result.has_manifest:
                    result.errors.append("Missing AndroidManifest.xml")
                if not result.has_dex:
                    result.errors.append("No classes*.dex found")

        except zipfile.BadZipFile as exc:
            result.errors.append(f"Not a valid zip/APK: {exc}")
            return result

        result.is_valid = not result.errors
        return result

    def _hash_file(self) -> Tuple[str, str]:
        sha256 = hashlib.sha256()
        md5 = hashlib.md5()
        with open(self.apk_path, "rb") as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b""):
                sha256.update(chunk)
                md5.update(chunk)
        return sha256.hexdigest(), md5.hexdigest()

def main() -> None:
    parser = argparse.ArgumentParser(description="Validate an APK file structure and hashes.")
    parser.add_argument("apk", type=Path, help="Path to the APK file")
    args = parser.parse_args()

    validator = APKValidator(args.apk)
    validation = validator.validate()

    result = {
        "apk": str(args.apk),
        "validation": vars(validation),
        "status": "REJECTED" if not validation.is_valid else "OK",
    }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()