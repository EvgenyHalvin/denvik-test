import { useState, useCallback, useEffect } from "react";

import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const XYFLOW_DATA_KEY = "xyflow-data";

type TSavedXYData = {
  nodes: Node[];
  edges: Edge[];
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const onNodesChangeInternal = useCallback(
    (changes) => {
      const changedNodes = applyNodeChanges(changes, nodes);
      setNodes(changedNodes);
    },
    [nodes, setNodes]
  );

  const onEdgesChangeInternal = useCallback(
    (changes) => {
      const changedEdges = applyEdgeChanges(changes, edges);
      setEdges(changedEdges);
    },
    [edges, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  useEffect(() => {
    const beforeUnloadWrite = () => {
      const data: TSavedXYData = { nodes, edges };
      localStorage.setItem(XYFLOW_DATA_KEY, JSON.stringify(data));
    };

    window.addEventListener("beforeunload", beforeUnloadWrite);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadWrite);
    };
  }, [nodes, edges]);

  useEffect(() => {
    const savedData = localStorage.getItem(XYFLOW_DATA_KEY);
    if (savedData) {
      const { nodes, edges } = JSON.parse(savedData) as TSavedXYData;
      setNodes(nodes);
      setEdges(edges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChangeInternal}
          onConnect={onConnect}
        >
          <Panel>
            <button onClick={addNode}>Add Node</button>
          </Panel>
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;
