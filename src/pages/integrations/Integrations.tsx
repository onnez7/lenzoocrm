
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  CreditCard, 
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  isEnabled: boolean;
  category: 'communication' | 'payment' | 'automation';
  config: Record<string, any>;
}

export default function Integrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Envie SMS e faça chamadas telefônicas',
      icon: Phone,
      isEnabled: false,
      category: 'communication',
      config: { accountSid: '', authToken: '', phoneNumber: '' }
    },
    {
      id: 'zapi',
      name: 'Z-API (WhatsApp)',
      description: 'Integração com WhatsApp Business',
      icon: MessageSquare,
      isEnabled: false,
      category: 'communication',
      config: { instanceId: '', token: '', webhookUrl: '' }
    },
    {
      id: 'email',
      name: 'Email SMTP',
      description: 'Configuração de servidor de email',
      icon: Mail,
      isEnabled: true,
      category: 'communication',
      config: { host: 'smtp.gmail.com', port: 587, username: '', password: '' }
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Gateway de pagamento do Mercado Pago',
      icon: CreditCard,
      isEnabled: false,
      category: 'payment',
      config: { accessToken: '', publicKey: '', webhookUrl: '' }
    },
    {
      id: 'asaas',
      name: 'Asaas',
      description: 'Plataforma de pagamentos Asaas',
      icon: CreditCard,
      isEnabled: false,
      category: 'payment',
      config: { apiKey: '', environment: 'sandbox', webhookUrl: '' }
    },
    {
      id: 'pagseguro',
      name: 'PagSeguro',
      description: 'Gateway de pagamento PagSeguro',
      icon: CreditCard,
      isEnabled: false,
      category: 'payment',
      config: { email: '', token: '', appId: '', appKey: '' }
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automação de workflows',
      icon: Zap,
      isEnabled: false,
      category: 'automation',
      config: { webhookUrl: '' }
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, isEnabled: !integration.isEnabled }
          : integration
      )
    );
    
    const integration = integrations.find(i => i.id === integrationId);
    toast({
      title: integration?.isEnabled ? "Integração desativada" : "Integração ativada",
      description: `${integration?.name} foi ${integration?.isEnabled ? 'desativada' : 'ativada'} com sucesso.`,
    });
  };

  const handleSaveConfig = (integrationId: string, config: Record<string, any>) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, config }
          : integration
      )
    );
    
    toast({
      title: "Configuração salva",
      description: "As configurações foram salvas com sucesso.",
    });
  };

  const handleTestWebhook = async (webhookUrl: string) => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Teste de integração"
        }),
      });

      toast({
        title: "Teste enviado",
        description: "O teste foi enviado para o webhook. Verifique se foi recebido corretamente.",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getCategoryIntegrations = (category: string) => 
    integrations.filter(integration => integration.category === category);

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card key={integration.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <integration.icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={integration.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {integration.isEnabled ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inativo
                </>
              )}
            </Badge>
            <Switch
              checked={integration.isEnabled}
              onCheckedChange={() => handleToggleIntegration(integration.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={() => setSelectedIntegration(integration)}
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </CardContent>
    </Card>
  );

  const ConfigurationModal = () => {
    if (!selectedIntegration) return null;

    const [config, setConfig] = useState(selectedIntegration.config);

    const updateConfig = (key: string, value: string) => {
      setConfig(prev => ({ ...prev, [key]: value }));
    };

    const saveConfig = () => {
      handleSaveConfig(selectedIntegration.id, config);
      setSelectedIntegration(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <selectedIntegration.icon className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Configurar {selectedIntegration.name}</CardTitle>
                  <CardDescription>{selectedIntegration.description}</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedIntegration(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configurações específicas por integração */}
            {selectedIntegration.id === 'twilio' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    value={config.accountSid || ''}
                    onChange={(e) => updateConfig('accountSid', e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    value={config.authToken || ''}
                    onChange={(e) => updateConfig('authToken', e.target.value)}
                    placeholder="Seu Auth Token do Twilio"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Número de Telefone</Label>
                  <Input
                    id="phoneNumber"
                    value={config.phoneNumber || ''}
                    onChange={(e) => updateConfig('phoneNumber', e.target.value)}
                    placeholder="+5511999999999"
                  />
                </div>
              </>
            )}

            {selectedIntegration.id === 'zapi' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="instanceId">Instance ID</Label>
                  <Input
                    id="instanceId"
                    value={config.instanceId || ''}
                    onChange={(e) => updateConfig('instanceId', e.target.value)}
                    placeholder="Seu Instance ID da Z-API"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={config.token || ''}
                    onChange={(e) => updateConfig('token', e.target.value)}
                    placeholder="Seu Token da Z-API"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={config.webhookUrl || ''}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                    placeholder="https://sua-aplicacao.com/webhook/zapi"
                  />
                </div>
              </>
            )}

            {selectedIntegration.id === 'email' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="host">Servidor SMTP</Label>
                  <Input
                    id="host"
                    value={config.host || ''}
                    onChange={(e) => updateConfig('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.port || ''}
                    onChange={(e) => updateConfig('port', e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="username"
                    type="email"
                    value={config.username || ''}
                    onChange={(e) => updateConfig('username', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={config.password || ''}
                    onChange={(e) => updateConfig('password', e.target.value)}
                    placeholder="Sua senha ou app password"
                  />
                </div>
              </>
            )}

            {selectedIntegration.id === 'mercadopago' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={config.accessToken || ''}
                    onChange={(e) => updateConfig('accessToken', e.target.value)}
                    placeholder="APP_USR-xxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Input
                    id="publicKey"
                    value={config.publicKey || ''}
                    onChange={(e) => updateConfig('publicKey', e.target.value)}
                    placeholder="APP_USR-xxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={config.webhookUrl || ''}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                    placeholder="https://sua-aplicacao.com/webhook/mercadopago"
                  />
                </div>
              </>
            )}

            {selectedIntegration.id === 'zapier' && (
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL do Zapier</Label>
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl || ''}
                  onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleTestWebhook(config.webhookUrl)}
                  className="mt-2"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Testar Webhook
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancelar
              </Button>
              <Button onClick={saveConfig}>
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrações</h2>
        <p className="text-gray-600">Configure suas integrações com serviços externos</p>
      </div>

      <Tabs defaultValue="communication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="payment">Pagamentos</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid gap-4">
            {getCategoryIntegrations('communication').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4">
            {getCategoryIntegrations('payment').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4">
            {getCategoryIntegrations('automation').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedIntegration && <ConfigurationModal />}
    </div>
  );
}
