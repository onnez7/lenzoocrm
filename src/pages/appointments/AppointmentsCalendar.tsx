import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import appointmentService, { Appointment } from "@/services/appointmentService";

interface CalendarEvent {
  id: number;
  title: string;
  client: string;
  time: string;
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado";
  employee: string;
}

const AppointmentsCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar agendamentos
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        console.log('Carregando agendamentos para o calendário...');
        const data = await appointmentService.getAppointments();
        console.log('Agendamentos carregados:', data);
        setAppointments(data);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Função para formatar data para chave do calendário (YYYY-MM-DD)
  const formatDateKey = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Converter appointments para eventos do calendário
  const getCalendarEvents = (): Record<string, CalendarEvent[]> => {
    const events: Record<string, CalendarEvent[]> = {};
    
    appointments.forEach(appointment => {
      const dateKey = formatDateKey(appointment.appointment_date);
      if (!dateKey) return; // Pular se não houver data válida
      
      if (!events[dateKey]) {
        events[dateKey] = [];
      }
      
      events[dateKey].push({
        id: appointment.id,
        title: appointment.service,
        client: appointment.client_name || 'Cliente não informado',
        time: appointmentService.formatTime(appointment.appointment_time),
        status: appointment.status,
        employee: appointment.employee_name || 'Profissional não informado'
      });
    });
    
    console.log('Eventos do calendário:', events);
    return events;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split('T')[0]
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    return appointmentService.getStatusColor(status);
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const calendarEvents = getCalendarEvents();
  const selectedEvents = selectedDate ? calendarEvents[selectedDate] || [] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando calendário...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendário de Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize agendamentos no calendário
          </p>
        </div>
        <Button onClick={() => navigate("/appointments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const events = calendarEvents[day.dateString] || [];
                const isSelected = selectedDate === day.dateString;
                const hasEvents = events.length > 0;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border border-border cursor-pointer transition-colors
                      ${!day.isCurrentMonth ? 'text-muted-foreground bg-muted/50' : ''}
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                      ${hasEvents && !isSelected ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => setSelectedDate(day.dateString)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate ${getStatusColor(event.status)}`}
                        >
                          {event.time} - {event.client}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{events.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? new Date(selectedDate).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })
                : 'Selecione uma data'
              }
            </CardTitle>
            <CardDescription>
              {selectedEvents.length === 0 
                ? 'Nenhum agendamento'
                : `${selectedEvents.length} agendamento(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedEvents.map(event => (
                  <div key={event.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="secondary" className={getStatusColor(event.status)}>
                        {appointmentService.getStatusLabel(event.status)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {event.client}
                      </div>
                      <div>
                        Profissional: {event.employee}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/appointments/${event.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/appointments/${event.id}/edit`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsCalendar;
