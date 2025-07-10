import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, Eye, FileText, Plus, User, Phone, Mail, MapPin, CreditCard, Loader2 } from "lucide-react";
import { clientService, ClientDetails as ClientDetailsType } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClientById(parseInt(id!));
      setClient(data);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Usar dados reais do cliente
  const prescriptions = client?.prescriptions || [];
  const appointments = client?.appointments || [];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-100 text-green-800">Ativo</Badge>,
      inactive: <Badge variant="secondary">Inativo</Badge>,
      completed: <Badge className="bg-green-100 text-green-800">Concluído</Badge>,
      scheduled: <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>,
      cancelled: <Badge variant="destructive">Cancelado</Badge>,
    };
    return badges[status as keyof typeof badges];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados do cliente...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p>Cliente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/clients/${id}/edit`}>
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/appointments/new?clientId=${id}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Link>
          </Button>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Compras
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof client.totalPurchases === 'number' ? `R$ ${client.totalPurchases.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge(client.email || client.phone ? 'active' : 'inactive')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Visita
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15/01/2024</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="prescriptions">Receitas</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Dados cadastrais do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">CPF</p>
                      <p className="text-sm text-muted-foreground">{client.cpf}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data de Nascimento</p>
                      <p className="text-sm text-muted-foreground">
                        {client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">
                        {client.address || 'Não informado'}<br />
                        {client.city && client.state && client.zip_code ? `${client.city}, ${client.state} - ${client.zip_code}` : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {client.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Observações</p>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Receitas Ópticas</CardTitle>
              <CardDescription>
                Histórico de receitas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">
                          Receita de {new Date(prescription.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Médico: {prescription.doctor}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Olho Direito (OD)</p>
                        <div className="text-xs space-y-1">
                          <p>Esférico: {prescription.right_eye_spherical || 'N/A'}</p>
                          <p>Cilíndrico: {prescription.right_eye_cylindrical || 'N/A'}</p>
                          <p>Eixo: {prescription.right_eye_axis ? `${prescription.right_eye_axis}°` : 'N/A'}</p>
                          <p>Adição: {prescription.right_eye_addition || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Olho Esquerdo (OE)</p>
                        <div className="text-xs space-y-1">
                          <p>Esférico: {prescription.left_eye_spherical || 'N/A'}</p>
                          <p>Cilíndrico: {prescription.left_eye_cylindrical || 'N/A'}</p>
                          <p>Eixo: {prescription.left_eye_axis ? `${prescription.left_eye_axis}°` : 'N/A'}</p>
                          <p>Adição: {prescription.left_eye_addition || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>DNP: {prescription.pd}</span>
                      <span>Altura: {prescription.height}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Compras</CardTitle>
              <CardDescription>
                Compras realizadas pelo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade de histórico de compras será implementada em breve.</p>
                <p className="text-sm mt-2">Total de compras: R$ {typeof client.totalPurchases === 'number' ? client.totalPurchases.toFixed(2).replace('.', ',') : '0,00'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                Histórico e próximos agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Nenhum agendamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(appointment.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground">{appointment.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{appointment.type}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{appointment.notes || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
