import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Presentation,
  Gavel
} from 'lucide-react';

type BoardReport = {
  id: string;
  title: string;
  report_type: 'quarterly' | 'annual' | 'ad_hoc' | 'compliance' | 'risk' | 'performance';
  period_start: string | null;
  period_end: string | null;
  executive_summary: string;
  key_metrics: any;
  significant_issues: string[];
  recommendations: string[];
  presented_by: string | null;
  presentation_date: string | null;
  approval_required: boolean;
  approved_by: string | null;
  approval_date: string | null;
  status: 'draft' | 'reviewed' | 'approved' | 'presented';
  created_by: string;
  created_at: string;
  updated_at: string;
};

type BoardMeeting = {
  id: string;
  title: string;
  meeting_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  meeting_type: 'regular' | 'special' | 'emergency';
  agenda_items: any[];
  attendees: string[];
  absentees: string[];
  minutes: string;
  decisions: string[];
  action_items: any[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function BoardReporting() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<BoardReport[]>([]);
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BoardReport | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('board_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('report_type', filterType);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading board reports:', error);
        setReports([]);
      } else {
        setReports((data || []) as BoardReport[]);
      }
    } catch (error) {
      console.error('Error loading board reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  const loadMeetings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('board_meetings')
        .select('*')
        .order('meeting_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading board meetings:', error);
        setMeetings([]);
      } else {
        setMeetings((data || []) as BoardMeeting[]);
      }
    } catch (error) {
      console.error('Error loading board meetings:', error);
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadMeetings();
  }, [loadReports, loadMeetings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'presented': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'presented': return <Presentation className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'annual': return 'bg-purple-100 text-purple-800';
      case 'compliance': return 'bg-green-100 text-green-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'ad_hoc': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reportStats = {
    total: reports.length,
    approved: reports.filter(r => r.status === 'approved').length,
    presented: reports.filter(r => r.status === 'presented').length,
    draft: reports.filter(r => r.status === 'draft').length
  };

  const meetingStats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    upcoming: meetings.filter(m => m.status === 'scheduled' && new Date(m.meeting_date) > new Date()).length
  };

  const reportTypes = [...new Set(reports.map(r => r.report_type))];

  return (
    <motion.div
      className="p-4 space-y-6 bg-gray-50 min-h-screen transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Gavel className="w-8 h-8 mr-3 text-blue-600" />
            {t("boardReporting", "Board Reporting")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("boardReportingDesc", "Generate and manage reports for board meetings and executive oversight")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (reports.length === 0) return;
              const csvContent = [
                ['Title', 'Type', 'Status', 'Period Start', 'Period End', 'Created At'].join(','),
                ...reports.map(r => [
                  `"${r.title.replace(/"/g, '""')}"`,
                  r.report_type,
                  r.status,
                  r.period_start || '',
                  r.period_end || '',
                  new Date(r.created_at).toLocaleDateString()
                ].join(','))
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `board-reports-${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("export", "Export")}
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createReport", "Create Report")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reportStats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{reportStats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Board Meetings</p>
              <p className="text-2xl font-bold text-purple-600">{meetingStats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-orange-600">{meetingStats.upcoming}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Report Types</option>
              {reportTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="presented">Presented</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Board Reports */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Board Reports
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.report_type)}`}>
                          {report.report_type.replace('_', ' ')}
                        </span>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status}</span>
                        </span>
                      </div>
                      {report.executive_summary && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{report.executive_summary}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {report.period_start && report.period_end && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                          </div>
                        )}
                        {report.presentation_date && (
                          <div className="flex items-center">
                            <Presentation className="w-4 h-4 mr-1" />
                            Presented: {new Date(report.presentation_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {report.significant_issues && report.significant_issues.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Key Issues:</p>
                          <div className="flex flex-wrap gap-2">
                            {report.significant_issues.slice(0, 3).map((issue, idx) => (
                              <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {issue}
                              </span>
                            ))}
                            {report.significant_issues.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                +{report.significant_issues.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to edit page when implemented
                            console.log('Edit report:', report.id);
                            // navigate(`/governance/board-reports/${report.id}/edit`);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Board Reports Yet</h3>
              <p className="text-gray-600 mb-6">Create your first board report to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Report
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Board Meetings */}
      {meetings.length > 0 && (
        <motion.div
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Board Meetings
            </h3>
            <div className="space-y-4">
              {meetings.slice(0, 5).map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                      {meeting.start_time && ` at ${meeting.start_time}`}
                      {meeting.location && ` • ${meeting.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMeetingTypeColor(meeting.meeting_type)}`}>
                      {meeting.meeting_type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                      meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      meeting.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}