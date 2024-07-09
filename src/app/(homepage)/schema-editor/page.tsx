"use client";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  Node,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import TableNode, { DBModel } from "./TableNode";
import { useQuery } from "convex-helpers/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect } from "react";

const nodeTypes = {
  TableNode: TableNode,
} satisfies NodeTypes;

export default function SchemaEditorPage() {
  const { data: _moodleTables, isPending: moodleTablesLoading } = useQuery(
    api.schema_editor.getMoodleTrackedTables,
    { hidden: false },
  );
  const moodleTablesList = _moodleTables?.tables;
  const moodleTableColumns = _moodleTables?.columns;

  const [nodes, setNodes] = useNodesState<DBModel>([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    if (!moodleTablesList || !moodleTableColumns) return;
    setNodes(
      moodleTablesList.map((table) => ({
        id: table._id,
        type: "TableNode",
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        },
        data: {
          name: table.name,
          columns: moodleTableColumns
            ?.filter((column) => column.table == table._id)
            .map((column) => ({
              name: column.name,
              type: column.type,
              // hasConnections: column.hasConnections,
            })),
        },
      })),
    );
    setEdges(
      moodleTableColumns.map((column) => ({
        id: column._id,
        source: column._id,
        target:
          moodleTableColumns[
            Math.floor(Math.random() * moodleTableColumns.length)
          ]._id,
      })),
    );
  }, [moodleTableColumns, moodleTablesList, setEdges, setNodes]);

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{
            hideAttribution: true,
          }}
        >
          <Controls
            // position="top-right"

            showFitView
            showZoom
          />
          <Background color="" variant={BackgroundVariant.Lines} gap={50} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
