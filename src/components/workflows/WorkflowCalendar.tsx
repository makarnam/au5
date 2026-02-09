import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { workflowCalendarService, WorkflowCalendarEvent, CreateCalendarEventPayload } from '../../services/workflowCalendarService';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface WorkflowCalendarProps {
  workflowId?: string;
  approvalRequestId?: string;
  showCreateButton?: boolean;
  onEventClick?: (event: WorkflowCalendarEvent) => void;
}

const WorkflowCalendar: React.FC<WorkflowCalendarProps> = ({
  workflowId,
  approvalRequestId,
  showCreateButton = true,
  onEventClick
}) => {
  const [events, setEvents] = useState<WorkflowCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<WorkflowCalendarEvent | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');

  // Load events
  useEffect(() => {
    loadEvents();
    loadStats();
  }, [workflowId, approvalRequestId, currentDate, filter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (workflowId) {
        filters.workflow_id = workflowId;
      }
      if (approvalRequestId) {
        filters.approval_request_id = approvalRequestId;
      }
      if (filter !== 'all') {
        filters.event_type = filter;
      }

      const result = await workflowCalendarService.getEvents(filters);
      if (result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await workflowCalendarService.getCalendarStats();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateEvent = async (eventData: CreateCalendarEventPayload) => {
    try {
      const result = await workflowCalendarService.createEvent({
        ...eventData,
        workflow_id: workflowId || '',
        approval_request_id: approvalRequestId,
      });

      if (result.data) {
        setCreateDialogOpen(false);
        loadEvents();
        loadStats();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await workflowCalendarService.deleteEvent(eventId);
      if (!result.error) {
        loadEvents();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleMarkCompleted = async (eventId: string) => {
    try {
      const result = await workflowCalendarService.markEventCompleted(eventId);
      if (!result.error) {
        loadEvents();
        loadStats();
      }
    } catch (error) {
      console.error('Error marking event completed:', error);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'workflow_deadline':
        return <Clock className="w-4 h-4" />;
      case 'workflow_meeting':
        return <Users className="w-4 h-4" />;
      case 'approval_reminder':
        return <AlertTriangle className="w-4 h-4" />;
      case 'escalation_notice':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: string, priority: string) => {
    if (priority === 'critical') return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority === 'medium') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate),
  });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start_at), date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Workflow Calendar</h2>
          {stats && (
            <div className="flex space-x-4">
              <Badge variant="outline" className="text-sm">
                {stats.total_events} Total Events
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.upcoming_events} Upcoming
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.overdue_events} Overdue
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="workflow_deadline">Deadlines</SelectItem>
              <SelectItem value="workflow_meeting">Meetings</SelectItem>
              <SelectItem value="approval_reminder">Reminders</SelectItem>
              <SelectItem value="escalation_notice">Escalations</SelectItem>
            </SelectContent>
          </Select>

          {showCreateButton && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Calendar Event</DialogTitle>
                  <DialogDescription>
                    Add a new calendar event for this workflow.
                  </DialogDescription>
                </DialogHeader>
                <CreateEventForm onSubmit={handleCreateEvent} onCancel={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Week View</CardTitle>
          <CardDescription>
            {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center font-medium text-sm p-2 border-b">
                {format(day, 'EEE')}
                <div className="text-xs text-gray-500">{format(day, 'd')}</div>
              </div>
            ))}

            {/* Day content */}
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day.toISOString()} className="min-h-32 p-2 border-r border-b">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`mb-2 p-2 rounded text-xs cursor-pointer border ${getEventColor(event.event_type, event.priority)}`}
                      onClick={() => onEventClick?.(event) || setSelectedEvent(event)}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {getEventIcon(event.event_type)}
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      <div className="text-xs opacity-75">
                        {format(parseISO(event.start_at), 'HH:mm')}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events found for the selected criteria.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getEventColor(event.event_type, event.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm opacity-75">{event.description}</p>
                        <div className="flex items-center space-x-4 text-xs mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(parseISO(event.start_at), 'MMM d, yyyy HH:mm')}</span>
                          </span>
                          {event.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge className={getEventColor(event.event_type, event.priority)}>
                        {event.priority}
                      </Badge>
                      
                      <div className="flex space-x-1">
                        {event.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkCompleted(event.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Event details and management
              </DialogDescription>
            </DialogHeader>
            <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Create Event Form Component
const CreateEventForm: React.FC<{
  onSubmit: (data: CreateCalendarEventPayload) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    event_type: 'workflow_meeting' as const,
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    location: '',
    meeting_url: '',
    priority: 'medium' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="event_type">Event Type</Label>
        <Select value={formData.event_type} onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workflow_deadline">Workflow Deadline</SelectItem>
            <SelectItem value="workflow_meeting">Workflow Meeting</SelectItem>
            <SelectItem value="approval_reminder">Approval Reminder</SelectItem>
            <SelectItem value="escalation_notice">Escalation Notice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_at">Start Date & Time</Label>
          <Input
            id="start_at"
            type="datetime-local"
            value={formData.start_at}
            onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_at">End Date & Time</Label>
          <Input
            id="end_at"
            type="datetime-local"
            value={formData.end_at}
            onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="meeting_url">Meeting URL</Label>
        <Input
          id="meeting_url"
          value={formData.meeting_url}
          onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Event
        </Button>
      </div>
    </form>
  );
};

// Event Details Component
const EventDetails: React.FC<{
  event: WorkflowCalendarEvent;
  onClose: () => void;
}> = ({ event, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleMarkCompleted = async () => {
    setLoading(true);
    try {
      await workflowCalendarService.markEventCompleted(event.id);
      onClose();
    } catch (error) {
      console.error('Error marking event completed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      setLoading(true);
      try {
        await workflowCalendarService.deleteEvent(event.id);
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Event Details</h3>
        <p className="text-sm text-gray-600">{event.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Start:</span>
          <div>{format(parseISO(event.start_at), 'MMM d, yyyy HH:mm')}</div>
        </div>
        <div>
          <span className="font-medium">End:</span>
          <div>{format(parseISO(event.end_at), 'MMM d, yyyy HH:mm')}</div>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <div>{event.status}</div>
        </div>
        <div>
          <span className="font-medium">Priority:</span>
          <div>{event.priority}</div>
        </div>
        {event.location && (
          <div>
            <span className="font-medium">Location:</span>
            <div>{event.location}</div>
          </div>
        )}
        {event.meeting_url && (
          <div>
            <span className="font-medium">Meeting URL:</span>
            <div>
              <a href={event.meeting_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Join Meeting
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        {event.status === 'scheduled' && (
          <Button onClick={handleMarkCompleted} disabled={loading}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Completed
          </Button>
        )}
        <Button variant="outline" onClick={handleDelete} disabled={loading}>
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default WorkflowCalendar;
