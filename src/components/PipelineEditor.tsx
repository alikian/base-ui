import { useState, useCallback, useMemo, useEffect, type CSSProperties } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel,
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageNode } from './MessageNode.tsx';
import { OpenAINode } from './OpenAINode.tsx';
import { CallHistoryNode } from './CallHistoryNode.tsx';
import { KnowlegeBaseReader } from './KnowlegeBaseReader.tsx';
import { InputNode } from './InputNode.tsx';
import openaiLogo from '../assets/openai-logomark.svg';

// Node types registry for React Flow
// Typing as any to avoid coupling to specific Node component props
const internalNodeTypes: any = {
  messageNode: MessageNode,
  openAINode: OpenAINode,
  callHistoryNode: CallHistoryNode,
  knowlegeBaseReader: KnowlegeBaseReader,
  inputNode: InputNode,
};

export interface PipelineGraph {
  pipelineName: string;
  pipelineId: string;
  nodes: Node[];
  edges: Edge[];
}

export interface PipelineEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  pipelineData?: Partial<PipelineGraph> | null;
  style?: CSSProperties;
  onSave?: (graph: PipelineGraph) => void;
}

export function PipelineEditor({ initialNodes, initialEdges, pipelineData, style, onSave }: PipelineEditorProps) {
  const initNodes: Node[] = (pipelineData?.nodes ?? initialNodes) ?? [];
  const initEdges: Edge[] = (pipelineData?.edges ?? initialEdges) ?? [];
  const [pipeName, setPipeName] = useState<string>(pipelineData?.pipelineName ?? 'Pipeline');
  const [nodes, setNodes] = useState<Node[]>(initNodes);
  const [edges, setEdges] = useState<Edge[]>(initEdges);
  // no-op

  // Inline title editing state
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameDraft, setNameDraft] = useState<string>(pipeName);

  // expose a stable updater so custom nodes can persist their field changes
  const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...(n as any).data, ...patch } } : n)));
  }, []);

  // allow nodes to rename their id (updates edges that reference the node)
  const renameNodeId = useCallback((oldId: string, newId: string) => {
    const trimmed = String(newId || '').trim();
    if (!trimmed || trimmed === oldId) return;
    setNodes((ns) => {
      if (ns.some((n) => n.id === trimmed)) {
        console.warn(`Node id "${trimmed}" already exists; rename ignored.`);
        return ns;
      }
      return ns.map((n) => (n.id === oldId ? { ...n, id: trimmed } : n));
    });
    setEdges((es) =>
      es.map((e) => ({
        ...e,
        source: e.source === oldId ? trimmed : e.source,
        target: e.target === oldId ? trimmed : e.target,
      }))
    );
  }, []);

  // attach an onChange handler into each node's data without mutating the originals
  const nodesWithHandlers: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...(n as any).data,
          onChange: (field: string, value: unknown) => updateNodeData(n.id, { [field]: value }),
          onRenameId: (nextId: string) => renameNodeId(n.id, nextId),
        },
      })),
    [nodes, updateNodeData, renameNodeId]
  );

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  // Add a new OpenAI node with a unique id and sensible defaults
  const addOpenAINode = useCallback(() => {
    setNodes((ns) => {
      const idSet = new Set(ns.map((n) => n.id));
      let i = 1;
      let newId = `openai-${i}`;
      while (idSet.has(newId)) {
        i += 1;
        newId = `openai-${i}`;
      }

      const modelOptions = [
        { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
        { value: 'gpt-4o', label: 'gpt-4o' },
        { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
      ];

      // Simple layout: stagger positions a bit based on index
      const x = 120 + ((i - 1) % 5) * 160;
      const y = 120 + Math.floor((i - 1) / 5) * 140;

      const newNode: Node = {
        id: newId,
        type: 'openAINode',
        position: { x, y },
        data: {
          system: '',
          prompt: '',
          model: modelOptions[0].value,
          modelOptions,
          logoUrl: openaiLogo,
        },
      };

      return [...ns, newNode];
    });
  }, []);

  // Add a new Knowledge Base Reader node
  const addKnowledgeBaseNode = useCallback(() => {
    setNodes((ns) => {
      const idSet = new Set(ns.map((n) => n.id));
      let i = 1;
      let newId = `kb-${i}`;
      while (idSet.has(newId)) {
        i += 1;
        newId = `kb-${i}`;
      }

      const kbOptions = [
        { value: 'docs', label: 'Docs' },
        { value: 'wiki', label: 'Wiki' },
        { value: 'tickets', label: 'Tickets' },
      ];

      const x = 120 + ((i - 1) % 5) * 160;
      const y = 120 + Math.floor((i - 1) / 5) * 140;

      const newNode: Node = {
        id: newId,
        type: 'knowlegeBaseReader',
        position: { x, y },
        data: {
          query: '',
          kb: kbOptions[0].value,
          kbOptions,
        },
      };

      return [...ns, newNode];
    });
  }, []);

  // Add a new Input node
  const addInputNode = useCallback(() => {
    setNodes((ns) => {
      const idSet = new Set(ns.map((n) => n.id));
      let i = 1;
      let newId = `input-${i}`;
      while (idSet.has(newId)) {
        i += 1;
        newId = `input-${i}`;
      }

      const x = 120 + ((i - 1) % 5) * 160;
      const y = 120 + Math.floor((i - 1) / 5) * 140;

      const newNode: Node = {
        id: newId,
        type: 'inputNode',
        position: { x, y },
        data: {
          inputType: 'text',
        },
      };

      return [...ns, newNode];
    });
  }, []);

  // Add a new Call History node
  const addCallHistoryNode = useCallback(() => {
    setNodes((ns) => {
      const idSet = new Set(ns.map((n) => n.id));
      let i = 1;
      let newId = `call-${i}`;
      while (idSet.has(newId)) {
        i += 1;
        newId = `call-${i}`;
      }

      const x = 120 + ((i - 1) % 5) * 160;
      const y = 120 + Math.floor((i - 1) / 5) * 140;

      const newNode: Node = {
        id: newId,
        type: 'callHistoryNode',
        position: { x, y },
        data: {
          history: [],
        },
      };

      return [...ns, newNode];
    });
  }, []);

  const handleSave = useCallback(() => {
    const current: PipelineGraph = {
      pipelineName: pipeName,
      pipelineId: pipelineData?.pipelineId || 'default-id',
      nodes,
      edges,
    };
    if (typeof onSave === 'function') {
      onSave(current);
    } else {
      console.warn('onSave callback not provided to PipelineEditor.');
    }
  }, [pipeName, nodes, edges, onSave]);

  // Global hotkey: Cmd/Ctrl+S triggers save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', margin: 0 }}>
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        nodeTypes={internalNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
  style={{ width: '100%', height: '100%', padding: 0, boxSizing: 'border-box', ...(style ?? {}) }}
        minZoom={0.2}
        maxZoom={2}
        // Keep initial zoom sensible in empty graphs
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#e5e7eb" />
        <Controls position="bottom-left" />

        <Panel
          position="top-left"
          style={{
            background: 'rgba(255,255,255,0.86)',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            fontWeight: 700,
            color: '#111827',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            top: 0,
            left: 0,
          }}
        >
          {isEditingName ? (
            <input
              value={nameDraft}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                const next = (nameDraft || '').trim() || 'Pipeline';
                setPipeName(next);
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.currentTarget as HTMLInputElement).blur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setNameDraft(pipeName);
                  setIsEditingName(false);
                }
              }}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                padding: '4px 6px',
                fontWeight: 700,
                color: '#111827',
                minWidth: 120,
              }}
            />
          ) : (
            <span
              onClick={() => {
                setNameDraft(pipeName);
                setIsEditingName(true);
              }}
              title="Click to rename"
              style={{ cursor: 'text', userSelect: 'none' }}
            >
              {pipeName}
            </span>
          )}
        </Panel>

        {/* Top-center panel with add buttons */}
        <Panel
          position="top-left"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 8,
            background: 'rgba(255,255,255,0.95)',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            zIndex: 11,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <button
            onClick={addOpenAINode}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + OpenAI
          </button>
          <button
            onClick={addInputNode}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Input
          </button>
          <button
            onClick={addCallHistoryNode}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Call History
          </button>
          <button
            onClick={addKnowledgeBaseNode}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Knowledge Base
          </button>
        </Panel>

        {/* Save button remains at top-right */}
        <Panel
          position="top-right"
          style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
          }}
        >
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 14px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </Panel>
      </ReactFlow>
      
    </div>
  );
}
