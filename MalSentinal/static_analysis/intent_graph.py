from typing import Dict, List
from manifest import ComponentInfo

class IntentGraphBuilder:
    """Inter-component communication triggers, derived from the manifest."""

    def __init__(self, components: List[ComponentInfo]):
        self.components = components

    def build(self) -> Dict[str, object]:
        nodes = [
            {"name": c.name, "kind": c.kind, "exported": c.exported}
            for c in self.components
        ]
        edges = [
            {"component": c.name, "kind": c.kind, "action": action}
            for c in self.components
            for action in c.intent_actions
            if action
        ]
        exported_attack_surface = [c.name for c in self.components if c.exported]

        return {
            "nodes": nodes,
            "action_edges": edges,
            "exported_components": exported_attack_surface,
        }

