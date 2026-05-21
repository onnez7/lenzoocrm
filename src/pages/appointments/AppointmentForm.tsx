import { useState, useEffect } from "react";
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
import { Calendar, Clock, User, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import appointmentService, { CreateAppointmentData, UpdateAppointmentData } from "@/services/appointmentService";

interface AppointmentForm {
  client_id: string;
  employee_id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  observations: string;
  status: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
}

interface Employee {
  id: number;
  name: string;
}

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  // Verificar se é edição (rota termina com /edit) ou visualização (apenas ID)
  const isEditing = location.pathname.endsWith('/edit');
  const isViewing = !!id && !isEditing;

  const [formData, setFormData] = useState<AppointmentForm>({
    client_id: "",
    employee_id: "",
    service: "",
    appointment_date: "",
    appointment_time: "",
    observations: "",
    status: "agendado"
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Garantir que os estados são sempre arrays válidos
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  // Função para formatar data para input HTML (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Função para formatar hora para input HTML (HH:MM)
  const formatTimeForInput = (timeString: string): string => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        
        // Carregar clientes e funcionários
        const [clientsData, employeesData] = await Promise.all([
          appointmentService.getClients().catch((error) => {
            console.error('Erro ao carregar clientes:', error);
            return [];
          }),
          appointmentService.getEmployees().catch((error) => {
            console.error('Erro ao carregar funcionários:', error);
            return [];
          })
        ]);

        console.log('Clients data:', clientsData);
        console.log('Employees data:', employeesData);

        // Garantir que sempre temos arrays
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);

        // Se estiver editando ou visualizando, carregar dados do agendamento
        if ((isEditing || isViewing) && id) {
          const appointment = await appointmentService.getAppointmentById(parseInt(id));
          console.log('Appointment data:', appointment);
          setFormData({
            client_id: appointment.client_id?.toString() || "",
            employee_id: appointment.employee_id?.toString() || "",
            service: appointment.service || "",
            appointment_date: formatDateForInput(appointment.appointment_date),
            appointment_time: formatTimeForInput(appointment.appointment_time),
            observations: appointment.observations || "",
            status: appointment.status || "agendado"
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [id, isEditing, isViewing, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && id) {
        // Atualizar agendamento
        const updateData: UpdateAppointmentData = {
          client_id: parseInt(formData.client_id),
          employee_id: formData.employee_id ? parseInt(formData.employee_id) : undefined,
          service: formData.service,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          status: formData.status as any,
          observations: formData.observations || undefined
        };

        await appointmentService.updateAppointment(parseInt(id), updateData);
        
        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso.",
        });
      } else {
        // Criar novo agendamento
        const createData: CreateAppointmentData = {
          client_id: parseInt(formData.client_id),
          employee_id: formData.employee_id ? parseInt(formData.employee_id) : undefined,
          service: formData.service,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          observations: formData.observations || undefined
        };

        await appointmentService.createAppointment(createData);
        
        toast({
          title: "Agendamento criado",
          description: "O agendamento foi criado com sucesso.",
        });
      }

      navigate("/appointments");
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/appointments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isViewing ? "Detalhes do Agendamento" : isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </h1>
          <p className="text-muted-foreground">
            {isViewing ? "Visualize as informações do agendamento" : isEditing ? "Atualize as informações do agendamento" : "Agende uma consulta ou atendimento"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => handleInputChange('client_id', value)}
                disabled={isViewing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(safeClients || []).map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!safeClients || safeClients.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cliente encontrado. Cadastre clientes primeiro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select 
                value={formData.service} 
                onValueChange={(value) => handleInputChange('service', value)}
                disabled={isViewing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentService.getServices().map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                  required
                  disabled={isViewing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                  required
                  disabled={isViewing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee">Profissional</Label>
              <Select 
                value={formData.employee_id} 
                onValueChange={(value) => handleInputChange('employee_id', value)}
                disabled={isViewing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {(safeEmployees || []).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!safeEmployees || safeEmployees.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  Nenhum funcionário encontrado. Cadastre funcionários primeiro.
                </p>
              )}
            </div>

            {(isEditing || isViewing) && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={isViewing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentService.getStatuses().map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Informações adicionais sobre o agendamento..."
                rows={3}
                disabled={isViewing}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/appointments")}>
            {isViewing ? "Voltar" : "Cancelar"}
          </Button>
          {!isViewing && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Atualizar" : "Agendar"}
                </>
              )}
            </Button>
          )}
          {isViewing && (
            <Button 
              type="button" 
              onClick={() => navigate(`/appointments/${id}/edit`)}
            >
              Editar Agendamento
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
