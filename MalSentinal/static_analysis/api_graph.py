from utils import FRAMEWORK_PREFIXES
from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple
from smali_scanner import CallEdge

# --------------------------------------------------------------------------- #
# Stage 5: Graph builders
# --------------------------------------------------------------------------- #

def is_framework_target(target: str) -> bool:
    return any(target.startswith(prefix) for prefix in FRAMEWORK_PREFIXES)


class APICallGraphBuilder:
    """
    Builds the raw call graph from scanned edges, then applies heuristic
    pruning: keep only nodes/edges that lie on a path terminating at an
    Android-framework API sink. This is what gives the "lightweight,
    densely semantic" FCG called for in the spec, instead of dumping the
    full (mostly app-internal, low-signal) call graph.
    """

    def __init__(self, edges: List[CallEdge], max_hops: int = 4):
        self.edges = edges
        self.max_hops = max_hops

    def build_raw_graph(self) -> Dict[str, Set[str]]:
        graph: Dict[str, Set[str]] = defaultdict(set)
        for edge in self.edges:
            graph[edge.caller].add(edge.callee)
        return graph

    def build_pruned_fcg(self) -> Dict[str, object]:
        graph = self.build_raw_graph()

        # Framework sinks: (caller, callee) pairs where callee is a framework API.
        framework_sinks = {
            (edge.caller, edge.callee) for edge in self.edges if is_framework_target(edge.callee)
        }

        # Reverse adjacency so we can walk backwards from each sink's caller
        # to find internal call chains that eventually reach it.
        reverse_graph: Dict[str, Set[str]] = defaultdict(set)
        for edge in self.edges:
            reverse_graph[edge.callee].add(edge.caller)

        keep_nodes: Set[str] = set()
        keep_edges: Set[Tuple[str, str]] = set()

        for caller, callee in framework_sinks:
            keep_nodes.add(caller)
            keep_nodes.add(callee)
            keep_edges.add((caller, callee))

            # BFS backwards (bounded depth) to capture the internal call
            # chain that leads into this framework call.
            frontier = deque([(caller, 0)])
            visited = {caller}
            while frontier:
                node, depth = frontier.popleft()
                if depth >= self.max_hops:
                    continue
                for pred in reverse_graph.get(node, ()):
                    keep_edges.add((pred, node))
                    keep_nodes.add(pred)
                    if pred not in visited:
                        visited.add(pred)
                        frontier.append((pred, depth + 1))

        return {
            "raw_node_count": len({n for e in self.edges for n in (e.caller, e.callee)}),
            "raw_edge_count": len(self.edges),
            "pruned_node_count": len(keep_nodes),
            "pruned_edge_count": len(keep_edges),
            "framework_sink_count": len(framework_sinks),
            "edges": [{"caller": c, "callee": e} for c, e in sorted(keep_edges)],
        }
