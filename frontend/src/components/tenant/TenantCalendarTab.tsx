import { useState } from 'react';
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

const eventTypes = [
  { label: 'Todos', color: 'bg-cs-cyan', value: 'todos' },
  { label: 'Reunião', color: 'bg-cs-blue', value: 'reuniao' },
  { label: 'Pessoal', color: 'bg-purple-500', value: 'pessoal' },
  { label: 'Tarefa', color: 'bg-cs-warning', value: 'tarefa' },
  { label: 'Lembrete', color: 'bg-cs-success', value: 'lembrete' }
];

const viewOptions = ['Mês', 'Semana', 'Dia', 'Agenda'];

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const mockEvents: Record<number, Array<{
  id: string;
  title: string;
  time: string;
  type: string;
  description?: string;
}>> = {
  15: [
    { id: '1', title: 'Reunião com Cliente VIP', time: '09:00', type: 'reuniao', description: 'Apresentação de proposta comercial' },
    { id: '2', title: 'Call de Follow-up', time: '14:30', type: 'reuniao' },
  ],
  19: [
    { id: '3', title: 'Entrega do Projeto X', time: '10:00', type: 'tarefa', description: 'Finalizar e enviar relatório final' },
    { id: '4', title: 'Aniversário João', time: '12:00', type: 'pessoal' },
    { id: '5', title: 'Lembrete: Renovar contrato', time: '16:00', type: 'lembrete' },
  ],
  22: [
    { id: '6', title: 'Treinamento Equipe', time: '08:00', type: 'tarefa', description: 'Workshop de vendas' },
  ],
  26: [
    { id: '7', title: 'Revisão Mensal', time: '11:00', type: 'reuniao' },
  ]
};

// Get all events as flat array sorted by date and time
const getAllEventsSorted = () => {
  const allEvents: Array<{
    id: string;
    title: string;
    time: string;
    type: string;
    description?: string;
    day: number;
  }> = [];
  
  Object.entries(mockEvents).forEach(([day, events]) => {
    events.forEach(event => {
      allEvents.push({ ...event, day: parseInt(day) });
    });
  });
  
  return allEvents.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });
};

// Generate calendar days dynamically based on month and year
const generateCalendarDays = (year: number, month: number) => {
  const days: Array<{ day: number; currentMonth: boolean; isToday?: boolean }> = [];
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Get number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get number of days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  // Today's date for comparison
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  // Add previous month's days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      currentMonth: true, 
      isToday: isCurrentMonth && today.getDate() === i 
    });
  }
  
  // Add next month's days to fill the grid (6 rows * 7 days = 42)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, currentMonth: false });
  }
  
  return days;
};

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const getEventTypeColor = (type: string) => {
  const eventType = eventTypes.find(t => t.value === type);
  return eventType?.color || 'bg-cs-cyan';
};

const getEventTypeLabel = (type: string) => {
  const eventType = eventTypes.find(t => t.value === type);
  return eventType?.label || 'Evento';
};

const formatDayName = (day: number, month: number, year: number) => {
  const date = new Date(year, month, day);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatShortDate = (day: number, month: number, year: number) => {
  const date = new Date(year, month, day);
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
};

export function TenantCalendarTab() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = Janeiro
  const [selectedView, setSelectedView] = useState('Mês');
  const [selectedTypes, setSelectedTypes] = useState(['Todos']);
  
  // Modal states
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    title: string;
    time: string;
    type: string;
    description?: string;
  } | null>(null);
  
  // Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [eventType, setEventType] = useState('reuniao');
  const [eventDescription, setEventDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayForView, setSelectedDayForView] = useState(new Date().getDate());

  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  // Get week days around selected day
  const getWeekDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weekStart = Math.max(1, selectedDayForView - new Date(currentYear, currentMonth, selectedDayForView).getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = weekStart + i;
      if (day <= daysInMonth) {
        days.push(day);
      }
    }
    // Fill remaining days if week starts late in month
    while (days.length < 7 && days[0] > 1) {
      days.unshift(days[0] - 1);
    }
    return days.slice(0, 7);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDayForView(today.getDate());
  };

  const toggleType = (type: string) => {
    if (type === 'Todos') {
      setSelectedTypes(['Todos']);
    } else {
      const newTypes = selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes.filter(t => t !== 'Todos'), type];
      setSelectedTypes(newTypes.length ? newTypes : ['Todos']);
    }
  };

  const handleDayClick = (day: number, currentMonth: boolean) => {
    if (!currentMonth) return;
    setSelectedDay(day);
    setShowDayModal(true);
  };

  const handleAddEvent = (day?: number) => {
    const targetDay = day || selectedDay || 19;
    setEventTitle('');
    setEventDate(`${targetDay.toString().padStart(2, '0')}/01/2026`);
    setEventTime('09:00');
    setEventType('reuniao');
    setEventDescription('');
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: typeof editingEvent) => {
    if (!event) return;
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDate(`${selectedDay?.toString().padStart(2, '0')}/01/2026`);
    setEventTime(event.time);
    setEventType(event.type);
    setEventDescription(event.description || '');
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log('Deletando evento:', eventId);
    // Implementação futura
  };

  const handleSaveEvent = () => {
    console.log('Salvando evento:', {
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      type: eventType,
      description: eventDescription,
      isEdit: !!editingEvent
    });
    setShowEventModal(false);
    setShowDayModal(false);
  };

  const getDayEvents = (day: number) => mockEvents[day] || [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {viewOptions.map((view) => (
            <Button
              key={view}
              variant={selectedView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView(view)}
              className={selectedView === view 
                ? 'bg-cs-cyan text-white' 
                : 'border-border text-cs-text-secondary'
              }
            >
              {view === 'Mês' && <CalendarIcon className="w-4 h-4 mr-1" />}
              {view === 'Semana' && <CalendarIcon className="w-4 h-4 mr-1" />}
              {view === 'Dia' && <CalendarIcon className="w-4 h-4 mr-1" />}
              {view === 'Agenda' && <List className="w-4 h-4 mr-1" />}
              {view}
            </Button>
          ))}
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input 
              placeholder="Buscar eventos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cs-bg-card border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-cs-bg-card border border-border rounded-lg">
            <AlertCircle className="w-4 h-4 text-cs-warning" />
            <span className="text-sm text-cs-text-secondary">Não sincronizado</span>
          </div>
          <Button variant="outline" size="sm" className="border-border text-cs-text-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
          <Button variant="ghost" size="icon" className="text-cs-text-muted">
            <Bell className="w-4 h-4" />
          </Button>
          <Button className="bg-cs-cyan text-white" onClick={() => handleAddEvent()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex items-center gap-2">
        {eventTypes.map((type) => (
          <Button
            key={type.label}
            variant={selectedTypes.includes(type.label) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleType(type.label)}
            className={selectedTypes.includes(type.label)
              ? 'bg-cs-bg-card border-cs-cyan text-cs-text-primary'
              : 'border-border text-cs-text-secondary'
            }
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${type.color}`} />
            {type.label}
          </Button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPreviousMonth}
                className="text-cs-text-muted hover:text-cs-text-primary"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-cs-text-primary min-w-[180px] text-center">
                {selectedView === 'Dia' 
                  ? `${selectedDayForView} de ${monthNames[currentMonth]} ${currentYear}`
                  : selectedView === 'Semana'
                    ? `Semana de ${monthNames[currentMonth]} ${currentYear}`
                    : `${monthNames[currentMonth]} ${currentYear}`
                }
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextMonth}
                className="text-cs-text-muted hover:text-cs-text-primary"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="border-border text-cs-text-secondary"
            >
              Hoje
            </Button>
          </div>

          {/* Month View */}
          {selectedView === 'Mês' && (
            <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 border-b border-border">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-cs-text-secondary">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayEvents = day.currentMonth ? getDayEvents(day.day) : [];
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(day.day, day.currentMonth)}
                      className={`min-h-[80px] p-1.5 border-r border-b border-border last:border-r-0 cursor-pointer transition-colors ${
                        !day.currentMonth ? 'bg-cs-bg-primary/50 cursor-default' : 'hover:bg-cs-bg-primary/30'
                      } ${day.isToday ? 'bg-purple-500/10 border-purple-500/30' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <span 
                          className={`text-sm ${
                            !day.currentMonth 
                              ? 'text-cs-text-muted' 
                              : day.isToday 
                                ? 'text-purple-400 font-bold' 
                                : 'text-cs-text-primary'
                          }`}
                        >
                          {day.day}
                        </span>
                        {hasEvents && (
                          <span className="text-xs text-cs-text-muted bg-cs-bg-primary px-1 py-0.5 rounded">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Mini event indicators */}
                      {day.currentMonth && dayEvents.slice(0, 1).map((event) => (
                        <div 
                          key={event.id}
                          className={`mt-1 px-1 py-0.5 rounded text-xs truncate ${getEventTypeColor(event.type)} text-white`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 1 && (
                        <span className="text-xs text-cs-text-muted mt-0.5 block">
                          +{dayEvents.length - 1} mais
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {selectedView === 'Semana' && (
            <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-cs-text-secondary">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {getWeekDays().map((day, idx) => {
                  const dayEvents = getDayEvents(day);
                  return (
                    <div
                      key={idx}
                      onClick={() => { setSelectedDayForView(day); handleDayClick(day, true); }}
                      className={`min-h-[300px] p-2 border-r border-border last:border-r-0 cursor-pointer hover:bg-cs-bg-primary/30 ${
                        day === selectedDayForView ? 'bg-cs-cyan/10' : ''
                      }`}
                    >
                      <div className="text-center mb-2">
                        <span className={`text-lg font-bold ${day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'text-purple-400' : 'text-cs-text-primary'}`}>
                          {day}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div 
                            key={event.id}
                            className={`p-2 rounded text-xs ${getEventTypeColor(event.type)} text-white`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="opacity-75">{event.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day View */}
          {selectedView === 'Dia' && (
            <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  {[...Array(7)].map((_, idx) => {
                    const day = selectedDayForView - 3 + idx;
                    if (day < 1 || day > 31) return null;
                    return (
                      <Button
                        key={idx}
                        variant={day === selectedDayForView ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedDayForView(day)}
                        className={day === selectedDayForView ? 'bg-cs-cyan text-white' : 'text-cs-text-secondary'}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 space-y-2 min-h-[400px]">
                {getDayEvents(selectedDayForView).length > 0 ? (
                  getDayEvents(selectedDayForView).map((event) => (
                    <div 
                      key={event.id}
                      className="p-4 bg-cs-bg-primary rounded-lg border border-border hover:border-cs-cyan/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full min-h-[60px] rounded ${getEventTypeColor(event.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-cs-text-muted" />
                            <span className="text-sm text-cs-cyan">{event.time}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getEventTypeColor(event.type)} text-white`}>
                              {getEventTypeLabel(event.type)}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-cs-text-primary">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-cs-text-muted mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <CalendarIcon className="w-12 h-12 text-cs-text-muted mb-3" />
                    <p className="text-cs-text-muted">Nenhum evento neste dia</p>
                    <Button 
                      size="sm" 
                      className="mt-3 bg-cs-cyan text-white"
                      onClick={() => handleAddEvent(selectedDayForView)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar evento
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agenda View */}
          {selectedView === 'Agenda' && (
            <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-cs-text-primary">Agenda - {monthNames[currentMonth]} {currentYear}</h3>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-4">
                  {Object.entries(mockEvents)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([day, events]) => (
                      <div key={day} className="border-l-2 border-cs-cyan pl-4">
                        <div className="text-sm font-medium text-cs-cyan mb-2">
                          {formatDayName(parseInt(day), currentMonth, currentYear)}
                        </div>
                        <div className="space-y-2">
                          {events.map((event) => (
                            <div 
                              key={event.id}
                              className="p-3 bg-cs-bg-primary rounded-lg border border-border hover:border-cs-cyan/30 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedDay(parseInt(day));
                                setShowDayModal(true);
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                                <span className="text-sm text-cs-text-muted">{event.time}</span>
                              </div>
                              <h4 className="font-medium text-cs-text-primary">{event.title}</h4>
                              {event.description && (
                                <p className="text-sm text-cs-text-muted mt-1">{event.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  {Object.keys(mockEvents).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarIcon className="w-12 h-12 text-cs-text-muted mb-3" />
                      <p className="text-cs-text-muted">Nenhum evento agendado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Events List Column */}
        <div className="lg:col-span-1">
          <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-cs-cyan" />
                <h3 className="font-semibold text-cs-text-primary">Próximos Eventos</h3>
              </div>
              <span className="text-xs text-cs-text-muted bg-cs-bg-primary px-2 py-1 rounded">
                {getAllEventsSorted().filter(event => {
                  // Filter by type buttons
                  const typeMatch = selectedTypes.includes('Todos') || 
                    selectedTypes.some(t => t.toLowerCase() === getEventTypeLabel(event.type).toLowerCase());
                  
                  // Filter by search query
                  const searchMatch = !searchQuery || 
                    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    getEventTypeLabel(event.type).toLowerCase().includes(searchQuery.toLowerCase()) ||
                    event.description?.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  return typeMatch && searchMatch;
                }).length} eventos
              </span>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="p-3 space-y-2">
                {getAllEventsSorted()
                  .filter(event => {
                    // Filter by type buttons
                    const typeMatch = selectedTypes.includes('Todos') || 
                      selectedTypes.some(t => t.toLowerCase() === getEventTypeLabel(event.type).toLowerCase());
                    
                    // Filter by search query
                    const searchMatch = !searchQuery || 
                      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      getEventTypeLabel(event.type).toLowerCase().includes(searchQuery.toLowerCase()) ||
                      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    return typeMatch && searchMatch;
                  })
                  .map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 bg-cs-bg-primary rounded-lg border border-border hover:border-cs-cyan/30 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedDay(event.day);
                      setShowDayModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventTypeColor(event.type)}`} />
                          <span className="text-xs text-cs-cyan font-medium">
                            {formatShortDate(event.day, 0, 2026)}
                          </span>
                          <span className="text-xs text-cs-text-muted">
                            {event.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-cs-text-primary truncate">
                          {event.title}
                        </h4>
                        <span className="text-xs text-cs-text-muted">
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(event.day);
                            handleEditEvent(event);
                          }}
                          className="h-7 w-7 text-cs-text-muted hover:text-cs-cyan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="h-7 w-7 text-cs-text-muted hover:text-cs-error"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getAllEventsSorted().length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="w-10 h-10 text-cs-text-muted mb-3" />
                    <p className="text-sm text-cs-text-muted">Nenhum evento agendado</p>
                    <Button
                      size="sm"
                      className="mt-3 bg-cs-cyan hover:bg-cs-cyan/90 text-white"
                      onClick={() => handleAddEvent()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Day Events Modal */}
      <Dialog open={showDayModal} onOpenChange={setShowDayModal}>
        <DialogContent className="bg-cs-bg-card border-border max-w-md">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-cs-cyan" />
              <div>
                <DialogTitle className="text-cs-text-primary capitalize">
                  {selectedDay && formatDayName(selectedDay, currentMonth, currentYear)}
                </DialogTitle>
                <p className="text-sm text-cs-text-muted mt-1">
                  {selectedDay && getDayEvents(selectedDay).length} eventos
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleAddEvent(selectedDay!)}
              className="text-cs-cyan hover:text-cs-cyan/80 hover:bg-cs-cyan/10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </DialogHeader>

          <ScrollArea className="max-h-[400px]">
            {selectedDay && getDayEvents(selectedDay).length > 0 ? (
              <div className="space-y-3">
                {getDayEvents(selectedDay).map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 bg-cs-bg-primary rounded-lg border border-border group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                          <span className="text-xs text-cs-text-muted">
                            {getEventTypeLabel(event.type)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-cs-text-primary">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-cs-text-muted">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{event.time}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-cs-text-muted mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditEvent(event)}
                          className="h-8 w-8 text-cs-text-muted hover:text-cs-cyan"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-8 w-8 text-cs-text-muted hover:text-cs-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="w-12 h-12 text-cs-text-muted mb-3" />
                <p className="text-cs-text-muted">Nenhum evento neste dia</p>
                <Button
                  className="mt-4 bg-cs-cyan hover:bg-cs-cyan/90 text-white"
                  onClick={() => handleAddEvent(selectedDay!)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Evento
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="bg-cs-bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cs-cyan">
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            <p className="text-sm text-cs-text-muted">
              Preencha os detalhes do evento
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-cs-text-primary mb-2">
                <CalendarIcon className="w-4 h-4" />
                Título do Evento *
              </label>
              <Input
                placeholder="Ex: Reunião com Cliente VIP"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="bg-cs-bg-primary border-border text-cs-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-cs-text-primary mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Data *
                </label>
                <Input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-cs-bg-primary border-border text-cs-text-primary"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-cs-text-primary mb-2">
                  <Clock className="w-4 h-4" />
                  Hora
                </label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="bg-cs-bg-primary border-border text-cs-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-cs-text-primary mb-2">
                <Tag className="w-4 h-4" />
                Tipo de Evento *
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {eventTypes.filter(t => t.value !== 'todos').map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="text-cs-text-primary"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-cs-text-primary mb-2 block">
                Descrição (opcional)
              </label>
              <Textarea
                placeholder="Adicione detalhes sobre o evento..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="bg-cs-bg-primary border-border text-cs-text-primary min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEventModal(false)}
                className="border-border text-cs-text-secondary"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEvent}
                className="bg-cs-cyan hover:bg-cs-cyan/90 text-white"
              >
                {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
