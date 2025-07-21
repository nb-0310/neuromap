import dagre from "@dagrejs/dagre";
import { Node, Edge } from "@/lib/analyzeRepo";

type RFNode = {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
  type?: string;
};
type RFEdge = { id: string; source: string; target: string };

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: RFNode[]; edges: RFEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 30, // horizontal spacing between sibling nodes
    ranksep: 50, // vertical spacing between layers
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 75, height: 50 }); // size of entire graph!
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      data: { label: node.label },
      position: { x: pos.x, y: pos.y },
      type: "custom",
    };
  });

  return { nodes: layoutedNodes, edges };
}
