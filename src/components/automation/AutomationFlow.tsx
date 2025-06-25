
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Play, Pause } from 'lucide-react';

// Tipos de nós customizados
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 5 },
    data: { 
      label: 'Novo Cliente',
      description: 'Disparado quando um novo cliente é cadastrado'
    },
  },
  {
    id: '2',
    type: 'action',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Enviar E-mail',
      description: 'Enviar e-mail de boas-vindas'
    },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 400, y: 100 },
    data: { 
      label: 'Cliente VIP?',
      description: 'Verificar se o cliente é VIP'
    },
  },
  {
    id: '4',
    type: 'action',
    position: { x: 250, y: 200 },
    data: { 
      label: 'Agendar Ligação',
      description: 'Agendar ligação de follow-up'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', label: 'Sim', animated: true },
];

// Componentes de nó customizados
const TriggerNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-300">
    <div className="flex items-center">
      <div className="ml-2">
        <div className="text-lg font-bold text-green-800">{data.label}</div>
        <div className="text-green-600 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
);

const ActionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-300">
    <div className="flex items-center">
      <div className="ml-2">
        <div className="text-lg font-bold text-blue-800">{data.label}</div>
        <div className="text-blue-600 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-300">
    <div className="flex items-center">
      <div className="ml-2">
        <div className="text-lg font-bold text-yellow-800">{data.label}</div>
        <div className="text-yellow-600 text-sm">{data.description}</div>
      </div>
    </div>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

export function AutomationFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: `Nova ${type === 'trigger' ? 'Trigger' : type === 'action' ? 'Ação' : 'Condição'}`,
        description: 'Configurar...'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const saveAutomation = () => {
    console.log('Salvando automação...', { nodes, edges });
    // Aqui você salvaria a automação na API
  };

  const toggleAutomation = () => {
    setIsRunning(!isRunning);
    console.log(isRunning ? 'Pausando automação...' : 'Iniciando automação...');
    // Aqui você controlaria o estado da automação na API
  };

  return (
    <div className="h-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editor de Automação</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addNode('trigger')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Trigger
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addNode('action')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ação
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addNode('condition')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Condição
              </Button>
              <Button variant="outline" size="sm" onClick={saveAutomation}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button 
                size="sm" 
                onClick={toggleAutomation}
                className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '500px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              style={{ backgroundColor: '#f8fafc' }}
            >
              <Controls />
              <MiniMap />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
