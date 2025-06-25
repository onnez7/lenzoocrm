
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Copy, FileText, Download } from "lucide-react";

interface NFeTemplate {
  id: string;
  name: string;
  type: 'venda' | 'devolucao' | 'complementar';
  isDefault: boolean;
  fields: {
    [key: string]: {
      label: string;
      value: string;
      type: 'text' | 'number' | 'date' | 'select';
      required: boolean;
      options?: string[];
    };
  };
  layout: {
    header: string;
    body: string;
    footer: string;
  };
}

const defaultTemplate: NFeTemplate = {
  id: "1",
  name: "Template Padrão - Venda",
  type: 'venda',
  isDefault: true,
  fields: {
    razaoSocial: {
      label: "Razão Social",
      value: "{{empresa.razaoSocial}}",
      type: "text",
      required: true
    },
    cnpj: {
      label: "CNPJ",
      value: "{{empresa.cnpj}}",
      type: "text",
      required: true
    },
    endereco: {
      label: "Endereço",
      value: "{{empresa.endereco}}",
      type: "text",
      required: true
    },
    numeroNota: {
      label: "Número da Nota",
      value: "{{nota.numero}}",
      type: "number",
      required: true
    },
    dataEmissao: {
      label: "Data de Emissão",
      value: "{{nota.dataEmissao}}",
      type: "date",
      required: true
    },
    clienteNome: {
      label: "Nome do Cliente",
      value: "{{cliente.nome}}",
      type: "text",
      required: true
    },
    clienteCpfCnpj: {
      label: "CPF/CNPJ do Cliente",
      value: "{{cliente.documento}}",
      type: "text",
      required: true
    }
  },
  layout: {
    header: `
      <div class="nfe-header">
        <h1>NOTA FISCAL ELETRÔNICA</h1>
        <div class="empresa-info">
          <h2>{{empresa.razaoSocial}}</h2>
          <p>CNPJ: {{empresa.cnpj}}</p>
          <p>{{empresa.endereco}}</p>
        </div>
        <div class="nota-info">
          <p>Número: {{nota.numero}}</p>
          <p>Data: {{nota.dataEmissao}}</p>
        </div>
      </div>
    `,
    body: `
      <div class="nfe-body">
        <div class="cliente-info">
          <h3>DADOS DO CLIENTE</h3>
          <p>Nome: {{cliente.nome}}</p>
          <p>CPF/CNPJ: {{cliente.documento}}</p>
        </div>
        
        <div class="produtos">
          <h3>PRODUTOS/SERVIÇOS</h3>
          <table class="produtos-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {{#produtos}}
              <tr>
                <td>{{nome}}</td>
                <td>{{quantidade}}</td>
                <td>R$ {{valorUnitario}}</td>
                <td>R$ {{valorTotal}}</td>
              </tr>
              {{/produtos}}
            </tbody>
          </table>
        </div>
        
        <div class="totais">
          <p>Subtotal: R$ {{totais.subtotal}}</p>
          <p>Impostos: R$ {{totais.impostos}}</p>
          <p><strong>Total: R$ {{totais.total}}</strong></p>
        </div>
      </div>
    `,
    footer: `
      <div class="nfe-footer">
        <p>Esta é uma representação simplificada da NFe.</p>
        <p>Consulte a validade desta nota em: www.nfe.fazenda.gov.br</p>
      </div>
    `
  }
};

export function NFeTemplateEditor() {
  const [currentTemplate, setCurrentTemplate] = useState<NFeTemplate>(defaultTemplate);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const updateField = (fieldKey: string, updates: Partial<NFeTemplate['fields'][string]>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          ...updates
        }
      }
    }));
  };

  const updateLayout = (section: keyof NFeTemplate['layout'], content: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [section]: content
      }
    }));
  };

  const saveTemplate = () => {
    console.log('Salvando template:', currentTemplate);
    setIsEditing(false);
    // Aqui você salvaria o template na API
  };

  const previewTemplate = () => {
    // Dados de exemplo para preview
    const mockData = {
      empresa: {
        razaoSocial: "Ótica Exemplo Ltda",
        cnpj: "12.345.678/0001-90",
        endereco: "Rua das Flores, 123 - Centro - São Paulo/SP"
      },
      nota: {
        numero: "000123456",
        dataEmissao: "15/01/2024"
      },
      cliente: {
        nome: "João da Silva",
        documento: "123.456.789-00"
      },
      produtos: [
        {
          nome: "Óculos Ray-Ban Aviador",
          quantidade: 1,
          valorUnitario: "450,00",
          valorTotal: "450,00"
        },
        {
          nome: "Estojo Premium",
          quantidade: 1,
          valorUnitario: "45,00",
          valorTotal: "45,00"
        }
      ],
      totais: {
        subtotal: "495,00",
        impostos: "74,25",
        total: "569,25"
      }
    };

    // Renderizar template com dados de exemplo
    let renderedHtml = currentTemplate.layout.header + 
                       currentTemplate.layout.body + 
                       currentTemplate.layout.footer;
    
    // Substituir variáveis simples
    renderedHtml = renderedHtml.replace(/\{\{empresa\.razaoSocial\}\}/g, mockData.empresa.razaoSocial);
    renderedHtml = renderedHtml.replace(/\{\{empresa\.cnpj\}\}/g, mockData.empresa.cnpj);
    renderedHtml = renderedHtml.replace(/\{\{empresa\.endereco\}\}/g, mockData.empresa.endereco);
    renderedHtml = renderedHtml.replace(/\{\{nota\.numero\}\}/g, mockData.nota.numero);
    renderedHtml = renderedHtml.replace(/\{\{nota\.dataEmissao\}\}/g, mockData.nota.dataEmissao);
    renderedHtml = renderedHtml.replace(/\{\{cliente\.nome\}\}/g, mockData.cliente.nome);
    renderedHtml = renderedHtml.replace(/\{\{cliente\.documento\}\}/g, mockData.cliente.documento);
    renderedHtml = renderedHtml.replace(/\{\{totais\.subtotal\}\}/g, mockData.totais.subtotal);
    renderedHtml = renderedHtml.replace(/\{\{totais\.impostos\}\}/g, mockData.totais.impostos);
    renderedHtml = renderedHtml.replace(/\{\{totais\.total\}\}/g, mockData.totais.total);

    return renderedHtml;
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Preview do Template</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              Voltar ao Editor
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div 
              className="nfe-preview"
              dangerouslySetInnerHTML={{ __html: previewTemplate() }}
              style={{
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.4',
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Editor de Templates NFe</h2>
          <p className="text-muted-foreground">
            Customize os templates de Nota Fiscal Eletrônica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </Button>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nome do Template</Label>
              <Input
                id="templateName"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateType">Tipo</Label>
              <Select
                value={currentTemplate.type}
                onValueChange={(value: 'venda' | 'devolucao' | 'complementar') => 
                  setCurrentTemplate(prev => ({ ...prev, type: value }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="complementar">Complementar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={currentTemplate.isDefault ? "default" : "outline"}>
                {currentTemplate.isDefault ? "Padrão" : "Personalizado"}
              </Badge>
            </div>

            <div className="space-y-3">
              <Label>Campos Disponíveis</Label>
              {Object.entries(currentTemplate.fields).map(([key, field]) => (
                <div key={key} className="p-3 border rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{field.label}</Label>
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                  </div>
                  <Input
                    value={field.value}
                    onChange={(e) => updateField(key, { value: e.target.value })}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor de Layout */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cabeçalho</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentTemplate.layout.header}
                onChange={(e) => updateLayout('header', e.target.value)}
                disabled={!isEditing}
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Corpo</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentTemplate.layout.body}
                onChange={(e) => updateLayout('body', e.target.value)}
                disabled={!isEditing}
                rows={12}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rodapé</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentTemplate.layout.footer}
                onChange={(e) => updateLayout('footer', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={saveTemplate}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Template
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
