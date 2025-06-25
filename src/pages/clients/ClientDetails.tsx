
import { useParams, Link } from "react-router-dom";
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
import { ArrowLeft, Calendar, Eye, FileText, Plus, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";

const ClientDetails = () => {
  const { id } = useParams();

  // Mock data
  const client = {
    id,
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    birthDate: "1985-05-15",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    status: "active",
    totalPurchases: "R$ 1.250,00",
    registrationDate: "2023-06-15",
    notes: "Cliente VIP. Prefere lentes de contato mensais.",
  };

  const prescriptions = [
    {
      id: "1",
      date: "2024-01-15",
      doctor: "Dr. Maria Oliveira",
      rightEye: { spherical: "-2.00", cylindrical: "-0.50", axis: "90°", addition: "+1.25" },
      leftEye: { spherical: "-1.75", cylindrical: "-0.25", axis: "85°", addition: "+1.25" },
      pd: "62mm",
      height: "18mm",
    },
    {
      id: "2",
      date: "2023-06-20",
      doctor: "Dr. Carlos Santos",
      rightEye: { spherical: "-1.75", cylindrical: "-0.25", axis: "90°", addition: "+1.00" },
      leftEye: { spherical: "-1.50", cylindrical: "-0.25", axis: "85°", addition: "+1.00" },
      pd: "62mm",
      height: "18mm",
    },
  ];

  const purchases = [
    {
      id: "1",
      date: "2024-01-15",
      items: "Óculos Ray-Ban RB3025 + Lentes Crizal",
      value: "R$ 650,00",
      status: "completed",
    },
    {
      id: "2",
      date: "2023-12-10",
      items: "Lentes de Contato Acuvue Oasys (6 meses)",
      value: "R$ 380,00",
      status: "completed",
    },
    {
      id: "3",
      date: "2023-08-22",
      items: "Óculos de Sol Oakley",
      value: "R$ 220,00",
      status: "completed",
    },
  ];

  const appointments = [
    {
      id: "1",
      date: "2024-01-15",
      time: "14:30",
      type: "Consulta",
      status: "completed",
      notes: "Renovação de receita",
    },
    {
      id: "2",
      date: "2024-02-20",
      time: "10:00",
      type: "Entrega",
      status: "scheduled",
      notes: "Entrega de óculos novos",
    },
  ];

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
              Cliente desde {new Date(client.registrationDate).toLocaleDateString('pt-BR')}
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
            <div className="text-2xl font-bold">{client.totalPurchases}</div>
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
              {getStatusBadge(client.status)}
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
                        {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">
                        {client.address}<br />
                        {client.city}, {client.state} - {client.zipCode}
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
                          <p>Esférico: {prescription.rightEye.spherical}</p>
                          <p>Cilíndrico: {prescription.rightEye.cylindrical}</p>
                          <p>Eixo: {prescription.rightEye.axis}</p>
                          <p>Adição: {prescription.rightEye.addition}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Olho Esquerdo (OE)</p>
                        <div className="text-xs space-y-1">
                          <p>Esférico: {prescription.leftEye.spherical}</p>
                          <p>Cilíndrico: {prescription.leftEye.cylindrical}</p>
                          <p>Eixo: {prescription.leftEye.axis}</p>
                          <p>Adição: {prescription.leftEye.addition}</p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {new Date(purchase.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{purchase.items}</TableCell>
                      <TableCell className="font-medium">{purchase.value}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{appointment.notes}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
