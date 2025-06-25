
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-2">Configure parâmetros globais do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configurações básicas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="system-name">Nome do Sistema</Label>
              <Input id="system-name" defaultValue="Lenzoo SaaS" />
            </div>
            <div>
              <Label htmlFor="support-email">Email de Suporte</Label>
              <Input id="support-email" type="email" defaultValue="suporte@lenzoo.com.br" />
            </div>
            <div>
              <Label htmlFor="trial-days">Dias de Trial</Label>
              <Input id="trial-days" type="number" defaultValue="14" />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração Stripe</CardTitle>
            <CardDescription>Configurações de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stripe-key">Chave Pública Stripe</Label>
              <Input id="stripe-key" placeholder="pk_test_..." />
            </div>
            <div>
              <Label htmlFor="webhook-secret">Webhook Secret</Label>
              <Input id="webhook-secret" placeholder="whsec_..." />
            </div>
            <Button>Atualizar Stripe</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Configure alertas e notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="alert-email">Email para Alertas</Label>
              <Input id="alert-email" type="email" defaultValue="admin@lenzoo.com.br" />
            </div>
            <div>
              <Label htmlFor="low-usage-threshold">Limite de Uso Baixo (%)</Label>
              <Input id="low-usage-threshold" type="number" defaultValue="20" />
            </div>
            <Button>Salvar Notificações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup & Segurança</CardTitle>
            <CardDescription>Configurações de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backup-frequency">Frequência de Backup</Label>
              <select className="w-full p-2 border rounded">
                <option>Diário</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </select>
            </div>
            <div>
              <Label htmlFor="retention-days">Retenção (dias)</Label>
              <Input id="retention-days" type="number" defaultValue="30" />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
