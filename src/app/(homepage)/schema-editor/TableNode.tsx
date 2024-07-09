"use client";
import React from "react";
import { Handle, NodeProps, Position } from "reactflow";

export type DBModel = {
  name: string;
  columns: {
    name: string;
    type: string;
    hasConnections?: boolean;
  }[];
  isChild?: boolean;
};

export type ModelConnection = {
  target: string;
  source: string;
  name: string;
};

export default function TableNode({ data }: NodeProps<DBModel>) {
  return (
    <div className="min-w-[250px] overflow-hidden rounded-md">
      {data.isChild && (
        <Handle id={data.name} position={Position.Top} type="target" />
      )}
      <div className="rounded-t-md bg-[#3d5787] p-0.5 text-center">
        <div className="font-bold text-white">
          <pre>{data.name}</pre>
        </div>
      </div>
      {data.columns.map(({ type, name, hasConnections }, index) => (
        <div
          key={index}
          className="flex justify-between p-0.5 text-white odd:bg-[#232323] even:bg-[#282828]"
        >
          <pre>{name}</pre>
          <pre>{type}</pre>
          {hasConnections && (
            <Handle
              position={Position.Right}
              id={`${data.name}-${name}`}
              type="source"
              style={{ top: 32 + 16 + 32 * index }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
