"use client";
import { Handle, Position } from "@xyflow/react";

type Props = {
  data: {
    label: string;
  };
};

export default function CustomNode({ data }: Props) {
  return (
    <div className="bg-muted/20 dark:bg-muted/10 border rounded-lg px-3 py-2 shadow-sm">
      <div className="text-xs font-medium">{data.label}</div>

      {/* Optional: add handles for connecting */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
