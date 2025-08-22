import { supabase } from "../lib/supabase";

export type UUID = string;

export interface WorkflowCalendarEvent {
  id: UUID;
  event_type: 'workflow_deadline' | 'workflow_meeting' | 'approval_reminder' | 'escalation_notice';
  workflow_id: UUID;
  approval_request_id?: UUID;
  workflow_step_id?: UUID;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location?: string;
  meeting_url?: string;
  attendees: any[];
  reminder_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by?: UUID;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventPayload {
  event_type: WorkflowCalendarEvent['event_type'];
  workflow_id: UUID;
  approval_request_id?: UUID;
  workflow_step_id?: UUID;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  timezone?: string;
  location?: string;
  meeting_url?: string;
  attendees?: any[];
  reminder_minutes?: number;
  priority?: WorkflowCalendarEvent['priority'];
}

export interface UpdateCalendarEventPayload {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  location?: string;
  meeting_url?: string;
  attendees?: any[];
  reminder_minutes?: number;
  status?: WorkflowCalendarEvent['status'];
  priority?: WorkflowCalendarEvent['priority'];
}

export interface CalendarEventFilter {
  workflow_id?: UUID;
  approval_request_id?: UUID;
  event_type?: WorkflowCalendarEvent['event_type'];
  status?: WorkflowCalendarEvent['status'];
  start_date?: string;
  end_date?: string;
  priority?: WorkflowCalendarEvent['priority'];
}

type Result<T> = { data: T | null; error: any | null };

export const workflowCalendarService = {
  // Create a new calendar event
  async createEvent(payload: CreateCalendarEventPayload): Promise<Result<{ event_id: UUID }>> {
    try {
      const { data, error } = await supabase
        .from('workflow_calendar_events')
        .insert({
          event_type: payload.event_type,
          workflow_id: payload.workflow_id,
          approval_request_id: payload.approval_request_id,
          workflow_step_id: payload.workflow_step_id,
          title: payload.title,
          description: payload.description,
          start_at: payload.start_at,
          end_at: payload.end_at,
          timezone: payload.timezone || 'UTC',
          location: payload.location,
          meeting_url: payload.meeting_url,
          attendees: payload.attendees || [],
          reminder_minutes: payload.reminder_minutes || 15,
          priority: payload.priority || 'medium',
        })
        .select('id')
        .single();

      if (error) return { data: null, error };
      return { data: { event_id: data.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get calendar events with filters
  async getEvents(filters: CalendarEventFilter = {}): Promise<Result<WorkflowCalendarEvent[]>> {
    try {
      let query = supabase
        .from('workflow_calendar_events')
        .select('*')
        .order('start_at', { ascending: true });

      if (filters.workflow_id) {
        query = query.eq('workflow_id', filters.workflow_id);
      }
      if (filters.approval_request_id) {
        query = query.eq('approval_request_id', filters.approval_request_id);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.start_date) {
        query = query.gte('start_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('end_at', filters.end_date);
      }

      const { data, error } = await query;
      if (error) return { data: null, error };
      return { data: data as WorkflowCalendarEvent[], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get upcoming events
  async getUpcomingEvents(days: number = 30): Promise<Result<WorkflowCalendarEvent[]>> {
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('workflow_calendar_events')
        .select('*')
        .gte('start_at', startDate)
        .lte('start_at', endDate)
        .not('status', 'in', ['completed', 'cancelled'])
        .order('start_at', { ascending: true });

      if (error) return { data: null, error };
      return { data: data as WorkflowCalendarEvent[], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get overdue events
  async getOverdueEvents(): Promise<Result<WorkflowCalendarEvent[]>> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('workflow_calendar_events')
        .select('*')
        .lt('end_at', now)
        .not('status', 'in', ['completed', 'cancelled'])
        .order('end_at', { ascending: true });

      if (error) return { data: null, error };
      return { data: data as WorkflowCalendarEvent[], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update calendar event
  async updateEvent(eventId: UUID, payload: UpdateCalendarEventPayload): Promise<Result<null>> {
    try {
      const { error } = await supabase
        .from('workflow_calendar_events')
        .update(payload)
        .eq('id', eventId);

      if (error) return { data: null, error };
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete calendar event
  async deleteEvent(eventId: UUID): Promise<Result<null>> {
    try {
      const { error } = await supabase
        .from('workflow_calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) return { data: null, error };
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create workflow deadline events
  async createWorkflowDeadlines(workflowId: UUID, approvalRequestId: UUID): Promise<Result<null>> {
    try {
      // Get workflow steps with deadlines
      const { data: steps, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .not('deadline_days', 'is', null);

      if (stepsError) return { data: null, error: stepsError };

      // Get approval request
      const { data: request, error: requestError } = await supabase
        .from('approval_requests')
        .select('created_at')
        .eq('id', approvalRequestId)
        .single();

      if (requestError) return { data: null, error: requestError };

      const createdDate = new Date(request.created_at);

      // Create deadline events for each step
      for (const step of steps) {
        if (step.deadline_days) {
          const deadlineDate = new Date(createdDate.getTime() + step.deadline_days * 24 * 60 * 60 * 1000);
          
          await this.createEvent({
            event_type: 'workflow_deadline',
            workflow_id: workflowId,
            approval_request_id: approvalRequestId,
            workflow_step_id: step.id,
            title: `Deadline: ${step.name}`,
            description: `Deadline for workflow step: ${step.name}`,
            start_at: deadlineDate.toISOString(),
            end_at: deadlineDate.toISOString(),
            priority: 'high',
            reminder_minutes: 60 * 24, // 1 day before
          });
        }
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create meeting events for workflow steps
  async createWorkflowMeetings(workflowId: UUID, approvalRequestId: UUID, meetings: Array<{
    step_id: UUID;
    title: string;
    start_at: string;
    end_at: string;
    location?: string;
    meeting_url?: string;
    attendees?: any[];
  }>): Promise<Result<null>> {
    try {
      for (const meeting of meetings) {
        await this.createEvent({
          event_type: 'workflow_meeting',
          workflow_id: workflowId,
          approval_request_id: approvalRequestId,
          workflow_step_id: meeting.step_id,
          title: meeting.title,
          description: `Meeting for workflow step`,
          start_at: meeting.start_at,
          end_at: meeting.end_at,
          location: meeting.location,
          meeting_url: meeting.meeting_url,
          attendees: meeting.attendees || [],
          priority: 'medium',
        });
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get calendar events for a specific workflow
  async getWorkflowEvents(workflowId: UUID): Promise<Result<WorkflowCalendarEvent[]>> {
    return this.getEvents({ workflow_id: workflowId });
  },

  // Get calendar events for a specific approval request
  async getApprovalRequestEvents(approvalRequestId: UUID): Promise<Result<WorkflowCalendarEvent[]>> {
    return this.getEvents({ approval_request_id: approvalRequestId });
  },

  // Mark event as completed
  async markEventCompleted(eventId: UUID): Promise<Result<null>> {
    return this.updateEvent(eventId, { status: 'completed' });
  },

  // Mark event as cancelled
  async markEventCancelled(eventId: UUID): Promise<Result<null>> {
    return this.updateEvent(eventId, { status: 'cancelled' });
  },

  // Get calendar statistics
  async getCalendarStats(): Promise<Result<{
    total_events: number;
    upcoming_events: number;
    overdue_events: number;
    completed_events: number;
    cancelled_events: number;
  }>> {
    try {
      const now = new Date().toISOString();

      // Get total events
      const { count: total } = await supabase
        .from('workflow_calendar_events')
        .select('*', { count: 'exact', head: true });

      // Get upcoming events
      const { count: upcoming } = await supabase
        .from('workflow_calendar_events')
        .select('*', { count: 'exact', head: true })
        .gte('start_at', now)
        .not('status', 'in', ['completed', 'cancelled']);

      // Get overdue events
      const { count: overdue } = await supabase
        .from('workflow_calendar_events')
        .select('*', { count: 'exact', head: true })
        .lt('end_at', now)
        .not('status', 'in', ['completed', 'cancelled']);

      // Get completed events
      const { count: completed } = await supabase
        .from('workflow_calendar_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get cancelled events
      const { count: cancelled } = await supabase
        .from('workflow_calendar_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      return {
        data: {
          total_events: total || 0,
          upcoming_events: upcoming || 0,
          overdue_events: overdue || 0,
          completed_events: completed || 0,
          cancelled_events: cancelled || 0,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default workflowCalendarService;
