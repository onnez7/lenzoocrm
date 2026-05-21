
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, Upload, Download, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceSettings {
  autoGenerate: boolean;
  sequentialNumber: number;
  defaultSeries: string;
  taxRegime: string;
  cnae: string;
  municipalInscription: string;
  stateInscription: string;
  emailSend: boolean;
  emailTemplate: string;
  apiUrl: string;
  apiToken: string;
  certificatePath: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

const initialSettings: InvoiceSettings = {
  autoGenerate: true,
  sequentialNumber: 1001,
  defaultSeries: "1",
  taxRegime: "simples",
  cnae: "4774-1/00",
  municipalInscription: "123456789",
  stateInscription: "123456789012",
  emailSend: true,
  emailTemplate: "default",
  apiUrl: "https://api.focusnfe.com.br",
  apiToken: "",
  certificatePath: ""
};

const mockTemplates: InvoiceTemplate[] = [
  {
    id: "1",
    name: "Template Padrão - Venda",
    isActive: true,
    createdAt: new Date("2024-01-10")
  },
  {
    id: "2",
    name: "Template Serviços",
    isActive: true,
    createdAt: new Date("2024-01-15")
  },
  {
    id: "3",
    name: "Template Consertos",
    isActive: false,
    createdAt: new Date("2024-01-20")
  }
];

const SettingsInvoices = () => {
  const [settings, setSettings] = useState<InvoiceSettings>(initialSettings);
  const [templates] = useState<InvoiceTemplate[]>(mockTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast({
      title: "Configurações salvas",
      description: "As configurações de nota fiscal foram atualizadas.",
    });
  };

  const handleSettingChange = (field: keyof InvoiceSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    
    // Simular teste de conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    toast({
      title: "Conexão testada",
      description: "Conexão com a API estabelecida com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Nota Fiscal</h1>
        <p className="text-muted-foreground">
          Configure a emissão e gestão de notas fiscais
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas para emissão de notas fiscais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Geração Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Gerar nota fiscal automaticamente ao finalizar venda
                </p>
              </div>
              <Switch
                checked={settings.autoGenerate}
                onCheckedChange={(checked) => handleSettingChange('autoGenerate', checked)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sequentialNumber">Próximo Número</Label>
                <Input
                  id="sequentialNumber"
                  type="number"
                  value={settings.sequentialNumber}
                  onChange={(e) => handleSettingChange('sequentialNumber', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultSeries">Série Padrão</Label>
                <Input
                  id="defaultSeries"
                  value={settings.defaultSeries}
                  onChange={(e) => handleSettingChange('defaultSeries', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRegime">Regime Tributário</Label>
                <Select
                  value={settings.taxRegime}
                  onValueChange={(value) => handleSettingChange('taxRegime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples Nacional</SelectItem>
                    <SelectItem value="presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE</Label>
                <Input
                  id="cnae"
                  value={settings.cnae}
                  onChange={(e) => handleSettingChange('cnae', e.target.value)}
                  placeholder="0000-0/00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipalInscription">Inscrição Municipal</Label>
                <Input
                  id="municipalInscription"
                  value={settings.municipalInscription}
                  onChange={(e) => handleSettingChange('municipalInscription', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateInscription">Inscrição Estadual</Label>
                <Input
                  id="stateInscription"
                  value={settings.stateInscription}
                  onChange={(e) => handleSettingChange('stateInscription', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de E-mail */}
        <Card>
          <CardHeader>
            <CardTitle>Envio por E-mail</CardTitle>
            <CardDescription>
              Configure o envio automático de notas por e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Envio Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar NF-e automaticamente para o cliente
                </p>
              </div>
              <Switch
                checked={settings.emailSend}
                onCheckedChange={(checked) => handleSettingChange('emailSend', checked)}
              />
            </div>

            {settings.emailSend && (
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Template de E-mail</Label>
                <Select
                  value={settings.emailTemplate}
                  onValueChange={(value) => handleSettingChange('emailTemplate', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Template Padrão</SelectItem>
                    <SelectItem value="professional">Template Profissional</SelectItem>
                    <SelectItem value="simple">Template Simples</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integração com API */}
        <Card>
          <CardHeader>
            <CardTitle>Integração com API</CardTitle>
            <CardDescription>
              Configure a integração com provedor de NF-e
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">URL da API</Label>
                <Input
                  id="apiUrl"
                  value={settings.apiUrl}
                  onChange={(e) => handleSettingChange('apiUrl', e.target.value)}
                  placeholder="https://api.provider.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiToken">Token de Acesso</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={settings.apiToken}
                  onChange={(e) => handleSettingChange('apiToken', e.target.value)}
                  placeholder="Seu token de acesso"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificatePath">Certificado Digital</Label>
              <div className="flex gap-2">
                <Input
                  id="certificatePath"
                  value={settings.certificatePath}
                  onChange={(e) => handleSettingChange('certificatePath', e.target.value)}
                  placeholder="Caminho do certificado"
                  readOnly
                />
                <Button type="button" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={testConnection} disabled={isLoading}>
                {isLoading ? "Testando..." : "Testar Conexão"}
              </Button>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Conectado
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Templates de NF-e */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de NF-e</CardTitle>
            <CardDescription>
              Gerencie os templates de nota fiscal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {template.createdAt.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsInvoices;
