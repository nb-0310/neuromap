"use client";

import {
  type Node,
  type Edge,
  ReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import CustomNode from "@/components/CustomNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  custom: CustomNode,
};

type MapProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  fitView?: boolean;
};

export default function Map({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  fitView,
}: MapProps) {
  // console.log ("Nodes: ", nodes)
  // console.log ("Edges: ", edges)
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView={fitView}
        nodeTypes={nodeTypes}
      />
    </div>
  );
}
