from typing import Dict, List
from utils import PERMISSION_API_HINTS
from smali_scanner import CallEdge

class PermissionGraphBuilder:
    """
    Nodes = requested permissions vs. a cheap heuristic estimate of
    "actively used" permissions, inferred by checking whether any call
    graph target references an API keyword associated with that
    permission (see PERMISSION_API_HINTS). This is a proxy signal, not a
    ground-truth mapping (that would require a full PScout/Axplorer table)
    but it is O(1) per permission and needs no external data file.
    """

    def __init__(self, requested_permissions: List[str], call_edges: List[CallEdge]):
        self.requested = requested_permissions
        self.call_edges = call_edges

    def build(self) -> Dict[str, object]:
        callee_blob = "\n".join(edge.callee for edge in self.call_edges)

        used: List[str] = []
        unused_or_unverified: List[str] = []

        for perm in self.requested:
            hints = PERMISSION_API_HINTS.get(perm)
            if hints and any(h in callee_blob for h in hints):
                used.append(perm)
            else:
                unused_or_unverified.append(perm)

        return {
            "requested": self.requested,
            "actively_used_heuristic": used,
            "unused_or_unverified": unused_or_unverified,
            "note": (
                "Usage detection is a lightweight keyword heuristic, not a "
                "full permission-to-API mapping (e.g. PScout/Axplorer). "
                "'unused_or_unverified' includes permissions with no known "
                "hint table entry as well as genuinely unused ones."
            ),
        }

