import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar, Plus, Edit, Trash2, Play, Pause, Clock, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

interface ScheduledReport {
   id: string;
   name: string;
   description?: string;
   template_id?: string;
   cron_expression: string;
   timezone: string;
   parameters: any;
   export_formats: string[];
   delivery_method: string;
   delivery_config: any;
   is_active: boolean;
   next_run_at?: string;
   last_run_at?: string;
   last_run_status?: string;
   created_at: string;
   updated_at: string;
   report_templates: Array<{
     name: string;
   }> | null;
 }

const ScheduledReportsPage: React.FC = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScheduledReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .select(`
          id,
          name,
          description,
          template_id,
          cron_expression,
          timezone,
          parameters,
          export_formats,
          delivery_method,
          delivery_config,
          is_active,
          next_run_at,
          last_run_at,
          last_run_status,
          created_at,
          updated_at,
          report_templates!template_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setScheduledReports(data || []);
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      setError(error instanceof Error ? error.message : 'Zamanlanmış raporlar yüklenirken hata oluştu');
      toast.error('Zamanlanmış raporlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Aktif' : 'Duraklatıldı';
  };

  const formatSchedule = (cronExpression: string) => {
    if (!cronExpression) return 'Bilinmeyen';

    // Parse common cron expressions
    const parts = cronExpression.split(' ');

    if (parts.length !== 5 && parts.length !== 6) {
      return cronExpression; // Return raw cron if we can't parse it
    }

    const minute = parts[0];
    const hour = parts[1];
    const day = parts[2];
    const month = parts[3];
    const dayOfWeek = parts[4];

    let scheduleText = '';

    // Daily at specific time
    if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      scheduleText = `Her gün ${hour}:${minute.padStart(2, '0')}`;
    }
    // Weekly on specific day
    else if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && dayOfWeek !== '*') {
      const dayNames = {
        '0': 'Pazar',
        '1': 'Pazartesi',
        '2': 'Salı',
        '3': 'Çarşamba',
        '4': 'Perşembe',
        '5': 'Cuma',
        '6': 'Cumartesi'
      };
      const dayName = dayNames[dayOfWeek as keyof typeof dayNames] || 'Pazartesi';
      scheduleText = `Her ${dayName} ${hour}:${minute.padStart(2, '0')}`;
    }
    // Monthly on specific day
    else if (minute !== '*' && hour !== '*' && day !== '*' && month === '*' && dayOfWeek === '*') {
      scheduleText = `Her ayın ${day}. günü ${hour}:${minute.padStart(2, '0')}`;
    }
    // Hourly
    else if (minute !== '*' && hour === '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      scheduleText = `Her saat ${minute}. dakikada`;
    }
    // Every few hours
    else if (minute !== '*' && hour.includes('/') && day === '*' && month === '*' && dayOfWeek === '*') {
      const hourInterval = hour.split('/')[1];
      scheduleText = `${hourInterval} saatte bir, ${minute}. dakikada`;
    }
    else {
      scheduleText = cronExpression; // Fallback to raw cron expression
    }

    return scheduleText;
  };

  const toggleScheduleStatus = async (reportId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .update({ is_active: !currentStatus })
        .eq('id', reportId);

      if (error) throw error;

      // Reload the scheduled reports
      await loadScheduledReports();
      toast.success(`Rapor ${!currentStatus ? 'aktifleştirildi' : 'duraklatıldı'}`);
    } catch (error) {
      console.error('Error updating schedule status:', error);
      toast.error('Rapor durumu güncellenirken hata oluştu');
    }
  };

  const deleteScheduledReport = async (reportId: string) => {
    if (!confirm('Bu zamanlanmış raporu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      // Reload the scheduled reports
      await loadScheduledReports();
      toast.success('Zamanlanmış rapor silindi');
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      toast.error('Zamanlanmış rapor silinirken hata oluştu');
    }
  };

  useEffect(() => {
    loadScheduledReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zamanlanmış Raporlar</h1>
          <p className="text-gray-600 mt-2">
            Rapor oluşturma ve dağıtımınızı otomatikleştirin
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadScheduledReports} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Zamanlama
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Zamanlanmış raporlar yükleniyor...</p>
            </div>
          ) : scheduledReports.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz zamanlanmış rapor yok.</p>
              <p className="text-sm text-gray-500 mt-2">
                İlk zamanlanmış raporunuzu oluşturmak için butona tıklayın.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <Badge className={getStatusColor(report.is_active)}>
                        {getStatusText(report.is_active)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Şablon: {report.report_templates?.[0]?.name || 'Bilinmeyen'}</p>
                      <p>Zamanlama: {formatSchedule(report.cron_expression)}</p>
                      <p>Son Çalışma: {report.last_run_at ? new Date(report.last_run_at).toLocaleDateString('tr-TR') : 'Henüz çalışmadı'}</p>
                      <p>Son Durum: {report.last_run_status || 'Bilinmeyen'}</p>
                      <p>Oluşturulma: {new Date(report.created_at).toLocaleDateString('tr-TR')}</p>
                      {report.description && (
                        <p>Açıklama: {report.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {report.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduleStatus(report.id, report.is_active)}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Duraklat
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduleStatus(report.id, report.is_active)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Devam Et
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteScheduledReport(report.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Schedule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Frequency Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="radio" name="frequency" />
                  <span className="text-sm">Daily</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="frequency" />
                  <span className="text-sm">Weekly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="frequency" />
                  <span className="text-sm">Monthly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="frequency" />
                  <span className="text-sm">Quarterly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="frequency" />
                  <span className="text-sm">Custom</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Delivery Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Email delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Save to documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Notify stakeholders</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledReportsPage;