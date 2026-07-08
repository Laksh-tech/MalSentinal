import logging
import re
# import shutil
# import subprocess
# import sys
# import time
# import xml.etree.ElementTree as ET
# import zipfile
# import argparse
# import hashlib
# import json
# from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #

logger = logging.getLogger("static_data_aquisition")


# --------------------------------------------------------------------------- #
# Constants / regexes (compiled once at import time)
# --------------------------------------------------------------------------- #

# Package prefixes treated as "Android framework" surface for pruning /
# permission-mapping purposes. Extend as needed.
FRAMEWORK_PREFIXES: Tuple[str, ...] = (
    "Landroid/",
    "Landroidx/",
    "Lcom/android/internal/",
    "Ljava/",
    "Ljavax/",
    "Ldalvik/",
    "Lkotlin/",
    "Lkotlinx/",
)

ANDROID_NS = "{http://schemas.android.com/apk/res/android}"

# Matches a smali class declaration line, e.g.:
#   .class public final Lcom/example/app/MainActivity;
CLASS_DEF_RE = re.compile(r"^\.class\s+.*?\s(?P<cls>L[\w/$]+;)\s*$")

# Matches a smali method declaration line, e.g.:
#   .method public onCreate(Landroid/os/Bundle;)V
METHOD_DEF_RE = re.compile(
    r"^\.method\s+.*?\s(?P<name>[\w$<>]+)\((?P<params>[^)]*)\)(?P<ret>[\w/;\[]*)\s*$"
)

METHOD_END_RE = re.compile(r"^\.end method\s*$")

# Matches any invoke-* instruction and captures the fully qualified target
# signature, e.g.:
#   invoke-virtual {p0, p1}, Landroid/app/Activity;->setContentView(I)V
INVOKE_RE = re.compile(
    r"^\s*invoke-(?P<kind>virtual|direct|static|interface|super)"
    r"(?:/range)?\s+\{[^}]*\},\s+"
    r"(?P<target>L[\w/$]+;->[\w$<>]+\([^)]*\)[\w/;\[]*)"
)

# Generic opcode line: leading whitespace + mnemonic token. Directives
# (lines starting with '.') and labels (':label') are excluded.
OPCODE_RE = re.compile(r"^\s+([a-z][a-z0-9\-/]*)\b")

# Very small, illustrative permission -> API-surface keyword table used for
# the "actively used" heuristic in the Permission Graph. This is *not* a
# replacement for a full PScout/Axplorer mapping; it is a cheap proxy meant
# to flag obviously-dead requested permissions.
PERMISSION_API_HINTS: Dict[str, Tuple[str, ...]] = {
    "android.permission.READ_CONTACTS": ("ContactsContract",),
    "android.permission.CAMERA": ("Camera", "CameraManager", "camera2"),
    "android.permission.ACCESS_FINE_LOCATION": ("LocationManager", "FusedLocationProviderClient"),
    "android.permission.ACCESS_COARSE_LOCATION": ("LocationManager", "FusedLocationProviderClient"),
    "android.permission.READ_SMS": ("Telephony$Sms", "SmsManager"),
    "android.permission.SEND_SMS": ("SmsManager",),
    "android.permission.RECORD_AUDIO": ("MediaRecorder", "AudioRecord"),
    "android.permission.READ_EXTERNAL_STORAGE": ("MediaStore", "Environment", "FileInputStream"),
    "android.permission.WRITE_EXTERNAL_STORAGE": ("Environment", "FileOutputStream"),
    "android.permission.INTERNET": ("HttpURLConnection", "OkHttpClient", "Socket"),
    "android.permission.READ_PHONE_STATE": ("TelephonyManager",),
    "android.permission.CALL_PHONE": ("Intent$ACTION_CALL", "TelecomManager"),
    "android.permission.BLUETOOTH": ("BluetoothAdapter", "BluetoothDevice"),
}
