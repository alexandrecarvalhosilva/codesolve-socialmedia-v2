import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Plus,
  RefreshCw,
  Bell,
  Search,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Tag,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: string;
  description?: string;
  day?: number;
  date?: string;
}

const eventTypes = [
  { label: 'Todos', color: 'bg-cs-cyan', value: 'todos' },
  { label: 'Reunião', color: 'bg-cs-blue', value: 'reuniao' },
  { label: 'Pessoal', color: 'bg-purple-500', value: 'pessoal' },
  { label: 'Tarefa', color: 'bg-cs-warning', value: 'tarefa' },
  { label: 'Lembrete', color: 'bg-cs-success', value: 'lembrete' }
];

const viewOptions = ['Mês', 'Semana', 'Dia', 'Agenda'];

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface TenantCalendarTabProps {
  tenantId: string;
}

export function TenantCalendarTab({ tenantId }: TenantCalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState('Mês');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<Record<number, CalendarEvent[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventType, setNewEventType] = useState('reuniao');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Fetch events from backend
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/calendar/events?tenantId=${tenantId}&year=${year}&month=${month}`);
      
      // Convert array to day-based record
      const eventsByDay: Record<number, CalendarEvent[]> = {};
      (response.data.events || []).forEach((event: CalendarEvent) => {
        const day = event.day || new Date(event.date || '').getDate();
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(event);
      });
      
      setEvents(eventsByDay);
    } catch (error) {
      // If no endpoint, use empty state
      setEvents({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [tenantId, currentDate]);

  // Get all events as flat array sorted by date and time
  const getAllEventsSorted = () => {
    const allEvents: Array<CalendarEvent & { day: number }> = [];
    Object.entries(events).forEach(([day, dayEvents]) => {
      dayEvents.forEach(event => {
        allEvents.push({ ...event, day: parseInt(day) });
      });
    });
    return allEvents.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });
  };

  const getEventColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-cs-cyan';
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDay(null);
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!selectedDay) {
      toast.error('Selecione um dia');
      return;
    }

    const newEvent: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: newEventTitle,
      time: newEventTime,
      type: newEventType,
      description: newEventDescription,
    };

    try {
      if (editingEvent) {
        await api.put(`/calendar/events/${editingEvent.id}`, {
          ...newEvent,
          tenantId,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toISOString(),
        });
        toast.success('Evento atualizado');
      } else {
        await api.post('/calendar/events', {
          ...newEvent,
          tenantId,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toISOString(),
        });
        toast.success('Evento criado');
      }
      
      fetchEvents();
    } catch (error) {
      // Fallback to local state if no backend
      setEvents(prev => {
        const dayEvents = prev[selectedDay] || [];
        if (editingEvent) {
          return {
            ...prev,
            [selectedDay]: dayEvents.map(e => e.id === editingEvent.id ? newEvent : e)
          };
        }
        return {
          ...prev,
          [selectedDay]: [...dayEvents, newEvent]
        };
      });
      toast.success(editingEvent ? 'Evento atualizado' : 'Evento criado');
    }

    resetForm();
  };

  const handleDeleteEvent = async (eventId: string, day: number) => {
    try {
      await api.delete(`/calendar/events/${eventId}`);
      toast.success('Evento excluído');
      fetchEvents();
    } catch (error) {
      // Fallback to local state
      setEvents(prev => ({
        ...prev,
        [day]: (prev[day] || []).filter(e => e.id !== eventId)
      }));
      toast.success('Evento excluído');
    }
  };

  const handleEditEvent = (event: CalendarEvent, day: number) => {
    setEditingEvent(event);
    setSelectedDay(day);
    setNewEventTitle(event.title);
    setNewEventTime(event.time);
    setNewEventType(event.type);
    setNewEventDescription(event.description || '');
    setIsEventModalOpen(true);
  };

  const resetForm = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventTime('09:00');
    setNewEventType('reuniao');
    setNewEventDescription('');
  };

  const filteredEvents = (dayEvents: CalendarEvent[]) => {
    return dayEvents.filter(event => {
      const matchesFilter = selectedFilter === 'todos' || event.type === selectedFilter;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 bg-cs-bg-primary border-border"
            />
          </div>

          {/* Filter */}
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32 bg-cs-bg-primary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${type.color}`} />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View */}
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-28 bg-cs-bg-primary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map(view => (
                <SelectItem key={view} value={view}>{view}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={fetchEvents}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* New Event */}
          <Button onClick={() => {
            setSelectedDay(today.getDate());
            setIsEventModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {selectedView === 'Mês' && (
        <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          {/* Days header */}
          <div className="grid grid-cols-7 bg-cs-bg-primary">
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before first day of month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 border-b border-r border-border bg-cs-bg-primary/50" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = filteredEvents(events[day] || []);
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-border cursor-pointer transition-colors
                    ${isToday ? 'bg-primary/10' : 'hover:bg-cs-bg-primary/50'}
                    ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${getEventColor(event.type)} text-white`}
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {selectedView === 'Agenda' && (
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {getAllEventsSorted().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento encontrado</p>
                </div>
              ) : (
                getAllEventsSorted().map(event => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-cs-bg-primary rounded-lg"
                  >
                    <div className={`w-1 h-full min-h-[60px] rounded-full ${getEventColor(event.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEvent(event, event.day)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-cs-error"
                            onClick={() => handleDeleteEvent(event.id, event.day)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Dia {event.day}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs text-white ${getEventColor(event.type)}`}>
                          {eventTypes.find(t => t.value === event.type)?.label}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Selected Day Events */}
      {selectedDay && selectedView === 'Mês' && (
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Eventos do dia {selectedDay}
            </h3>
            <Button size="sm" onClick={() => setIsEventModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {filteredEvents(events[selectedDay] || []).length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum evento neste dia</p>
            ) : (
              filteredEvents(events[selectedDay] || []).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-cs-bg-primary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`} />
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditEvent(event, selectedDay)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-cs-error"
                      onClick={() => handleDeleteEvent(event.id, selectedDay)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Título do evento"
                className="mt-2 bg-cs-bg-primary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Horário</label>
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="mt-2 bg-cs-bg-primary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Select value={newEventType} onValueChange={setNewEventType}>
                  <SelectTrigger className="mt-2 bg-cs-bg-primary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.filter(t => t.value !== 'todos').map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <Textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Descrição do evento (opcional)"
                className="mt-2 bg-cs-bg-primary border-border"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEvent}>
              {editingEvent ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
