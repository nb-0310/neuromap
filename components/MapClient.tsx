"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import Map from "@/components/Map";
import { getLayoutedElements } from "@/lib/layoutGraph";

type Props = {
  incLoadingCount: () => void;
};

export default function MapClient({ incLoadingCount }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!owner || !repo) return;

      try {
        const res = await fetch(`/api/validate-repo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoUrl: `https://github.com/${owner}/${repo}`,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          // console.error("Error:", data);
          return;
        }

        if (!data.analysis || !data.analysis.nodes || !data.analysis.edges) {
          // console.error("Analysis data missing:", data);
          return;
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(data.analysis.nodes, data.analysis.edges, "TB");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        incLoadingCount();
      } catch { 
        incLoadingCount();
      } finally {
        incLoadingCount();
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));
  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge(connection, eds));

  if (!mounted) return null;

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-muted-foreground w-full">
        <Map
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView={true}
        />
      </div>
    </main>
  );
}
