
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  CreditCard, 
  Bell,
  Globe,
  Users,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: `As configurações de ${section} foram atualizadas com sucesso.`,
      });
      setIsLoading(false);
    }, 1000);
  };

  const systemStatus = {
    database: { status: 'healthy', latency: '12ms' },
    api: { status: 'healthy', latency: '45ms' },
    storage: { status: 'warning', usage: '78%' },
    cache: { status: 'healthy', hitRate: '94%' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-2">Configure e monitore todos os aspectos do sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Básicas
                </CardTitle>
                <CardDescription>Informações principais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="system-name">Nome do Sistema</Label>
                  <Input id="system-name" defaultValue="Lenzoo SaaS" />
                </div>
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue="Lenzoo Tecnologia" />
                </div>
                <div>
                  <Label htmlFor="admin-email">Email Principal</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@lenzoo.com.br" />
                </div>
                <div>
                  <Label htmlFor="support-phone">Telefone de Suporte</Label>
                  <Input id="support-phone" defaultValue="(11) 3000-0000" />
                </div>
                <Button onClick={() => handleSaveSettings('Geral')} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Regionais
                </CardTitle>
                <CardDescription>Localização e formatação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select className="w-full p-2 border rounded" id="timezone">
                    <option value="America/Sao_Paulo">América/São Paulo (UTC-3)</option>
                    <option value="America/Manaus">América/Manaus (UTC-4)</option>
                    <option value="America/Rio_Branco">América/Rio Branco (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="currency">Moeda Padrão</Label>
                  <select className="w-full p-2 border rounded" id="currency">
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="date-format">Formato de Data</Label>
                  <select className="w-full p-2 border rounded" id="date-format">
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>
                <Button onClick={() => handleSaveSettings('Regional')}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Políticas de Segurança
                </CardTitle>
                <CardDescription>Configure as regras de segurança do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação em Dois Fatores</Label>
                    <p className="text-sm text-gray-500">Obrigatório para administradores</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="password-policy">Política de Senhas</Label>
                  <select className="w-full p-2 border rounded mt-1" id="password-policy">
                    <option value="strong">Forte (8+ chars, números, símbolos)</option>
                    <option value="medium">Média (6+ chars, números)</option>
                    <option value="basic">Básica (6+ chars)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
                <div>
                  <Label htmlFor="max-login-attempts">Máximo de Tentativas de Login</Label>
                  <Input id="max-login-attempts" type="number" defaultValue="5" />
                </div>
                <Button onClick={() => handleSaveSettings('Segurança')}>
                  Atualizar Políticas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Chaves de API
                </CardTitle>
                <CardDescription>Gerencie chaves de acesso à API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chave Master</p>
                      <p className="text-sm text-gray-500">lz_live_***************</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Ativa</Badge>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chave Webhooks</p>
                      <p className="text-sm text-gray-500">whk_***************</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Ativa</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  + Gerar Nova Chave
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Integração Stripe
                </CardTitle>
                <CardDescription>Configure pagamentos e assinaturas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripe-publishable">Chave Pública Stripe</Label>
                  <Input id="stripe-publishable" placeholder="pk_live_..." />
                </div>
                <div>
                  <Label htmlFor="stripe-secret">Chave Secreta Stripe</Label>
                  <Input id="stripe-secret" type="password" placeholder="sk_live_..." />
                </div>
                <div>
                  <Label htmlFor="webhook-endpoint">Endpoint Webhook</Label>
                  <Input id="webhook-endpoint" placeholder="https://api.lenzoo.com/webhooks/stripe" />
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input id="webhook-secret" type="password" placeholder="whsec_..." />
                </div>
                <Button onClick={() => handleSaveSettings('Stripe')}>
                  Atualizar Integração
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuração de Email
                </CardTitle>
                <CardDescription>SMTP e templates de email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-security">Segurança</Label>
                    <select className="w-full p-2 border rounded">
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">Nenhuma</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtp-user">Usuário</Label>
                  <Input id="smtp-user" placeholder="noreply@lenzoo.com.br" />
                </div>
                <div>
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input id="smtp-password" type="password" />
                </div>
                <Button onClick={() => handleSaveSettings('Email')}>
                  Testar e Salvar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>Configure quando e como enviar notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notificações de Sistema</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Novo Franqueado Registrado</Label>
                      <p className="text-sm text-gray-500">Notificar quando um novo franqueado se cadastra</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Assinatura Expirada</Label>
                      <p className="text-sm text-gray-500">Alertar sobre assinaturas que expiraram</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Limite de Uso Atingido</Label>
                      <p className="text-sm text-gray-500">Notificar quando um franqueado atinge 90% do limite</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Relatórios Automáticos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="daily-report">Relatório Diário</Label>
                    <select className="w-full p-2 border rounded mt-1">
                      <option value="disabled">Desabilitado</option>
                      <option value="enabled">08:00 todos os dias</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="weekly-report">Relatório Semanal</Label>
                    <select className="w-full p-2 border rounded mt-1">
                      <option value="disabled">Desabilitado</option>
                      <option value="monday">Segunda-feira 09:00</option>
                      <option value="friday">Sexta-feira 17:00</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Notificações')}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
                <CardDescription>Monitoramento em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(systemStatus).map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {status.status === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : status.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="capitalize">{key}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {'latency' in status && `${status.latency}`}
                      {'usage' in status && `${status.usage}`}
                      {'hitRate' in status && `${status.hitRate}`}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Manutenção
                </CardTitle>
                <CardDescription>Agendamento e logs de manutenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Próxima Manutenção</Label>
                  <p className="text-sm text-gray-600">Domingo, 15 de Dezembro às 02:00</p>
                </div>
                <div>
                  <Label>Última Atualização</Label>
                  <p className="text-sm text-gray-600">v2.1.3 - 28 de Novembro</p>
                </div>
                <div>
                  <Label>Uptime</Label>
                  <p className="text-sm text-gray-600">99.97% (últimos 30 dias)</p>
                </div>
                <Button variant="outline" className="w-full">
                  Ver Logs de Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Backup</CardTitle>
                <CardDescription>Políticas automáticas de backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                  <select className="w-full p-2 border rounded mt-1" id="backup-frequency">
                    <option value="daily">Diário às 02:00</option>
                    <option value="weekly">Semanal - Domingo</option>
                    <option value="monthly">Mensal - Dia 1</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="retention-policy">Política de Retenção</Label>
                  <select className="w-full p-2 border rounded mt-1" id="retention-policy">
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                    <option value="90">90 dias</option>
                    <option value="365">1 ano</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Incremental</Label>
                    <p className="text-sm text-gray-500">Apenas mudanças desde o último backup</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={() => handleSaveSettings('Backup')}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backups Recentes</CardTitle>
                <CardDescription>Histórico dos últimos backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">Backup Completo</p>
                    <p className="text-sm text-gray-500">Hoje às 02:00</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Sucesso</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">Backup Incremental</p>
                    <p className="text-sm text-gray-500">Ontem às 02:00</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Sucesso</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">Backup Completo</p>
                    <p className="text-sm text-gray-500">2 dias atrás</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Sucesso</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Executar Backup Manual
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
