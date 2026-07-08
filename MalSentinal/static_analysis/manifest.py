from __future__ import annotations

import xml.etree.ElementTree as ET
from lxml import etree as lxml_ET  # Added for fault-tolerant parsing

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional
from utils import logger, ANDROID_NS 

# --------------------------------------------------------------------------- #
# Stage 3: Manifest parser
# --------------------------------------------------------------------------- #

@dataclass
class ComponentInfo:
    name: str
    kind: str  # activity | service | receiver | provider
    exported: Optional[bool]
    intent_actions: List[str] = field(default_factory=list)


@dataclass
class ManifestInfo:
    package: Optional[str] = None
    requested_permissions: List[str] = field(default_factory=list)
    components: List[ComponentInfo] = field(default_factory=list)
    min_sdk: Optional[str] = None
    target_sdk: Optional[str] = None


class ManifestParser:
    """Parses the plain-text AndroidManifest.xml apktool decodes."""

    def __init__(self, manifest_path: Path):
        self.manifest_path = manifest_path

    def parse(self) -> ManifestInfo:
        info = ManifestInfo()
        if not self.manifest_path.exists():
            logger.warning("AndroidManifest.xml not found at %s", self.manifest_path)
            return info

        try:
            # 1. Try standard strict parsing first
            tree = ET.parse(self.manifest_path)
            root = tree.getroot()
        except ET.ParseError:
            # 2. If malware intentionally corrupted the XML to crash the pipeline, recover it
            logger.warning("Malformed XML detected (Anti-Analysis technique). Engaging recovery parser...")
            try:
                parser = lxml_ET.XMLParser(recover=True)
                tree = lxml_ET.parse(str(self.manifest_path), parser=parser)
                root = tree.getroot()
            except Exception as e:
                logger.error("Complete failure parsing manifest even with recovery: %s", e)
                return info

        if root is None:
            return info

        # --- Standard Extraction Logic Resumes Below ---
        info.package = root.attrib.get("package")

        uses_sdk = root.find("uses-sdk")
        if uses_sdk is not None:
            info.min_sdk = uses_sdk.attrib.get(f"{ANDROID_NS}minSdkVersion")
            info.target_sdk = uses_sdk.attrib.get(f"{ANDROID_NS}targetSdkVersion")

        for perm in root.findall("uses-permission"):
            name = perm.attrib.get(f"{ANDROID_NS}name")
            if name:
                info.requested_permissions.append(name)

        application = root.find("application")
        if application is not None:
            for kind, tag in (
                ("activity", "activity"),
                ("service", "service"),
                ("receiver", "receiver"),
                ("provider", "provider"),
            ):
                for node in application.findall(tag):
                    name = node.attrib.get(f"{ANDROID_NS}name", "<unnamed>")
                    exported_raw = node.attrib.get(f"{ANDROID_NS}exported")
                    exported = None
                    if exported_raw is not None:
                        exported = exported_raw.lower() == "true"

                    actions = [
                        action.attrib.get(f"{ANDROID_NS}name", "")
                        for filt in node.findall("intent-filter")
                        for action in filt.findall("action")
                    ]
                    info.components.append(
                        ComponentInfo(name=name, kind=kind, exported=exported, intent_actions=actions)
                    )

        return info
    