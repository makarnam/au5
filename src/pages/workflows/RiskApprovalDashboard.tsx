import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuthStore } from '../../store/authStore';
import workflows from '../../services/workflows';
import riskService from '../../services/riskService';
import { ApprovalRequest, Risk } from '../../types';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';

const RiskApprovalDashboard: React.FC = () => {
  const { user, checkPermission } = useAuthStore();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const canApprove = checkPermission(['admin', 'super_admin', 'risk_manager', 'supervisor']);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [pendingData, myTasksData, recentData] = await Promise.all([
        workflows.getInstances({ 
          entity_type: 'risk', 
          status: 'pending_approval',
          limit: 10 
        }),
        workflows.getMyTasks(),
        workflows.getInstances({ 
          entity_type: 'risk',
          limit: 10 
        })
      ]);

      setPendingApprovals(pendingData.data || []);
      setMyTasks(myTasksData.data || []);
      setRecentApprovals(recentData.data || []);

      // İstatistikleri hesapla
      const pendingCount = pendingData.data?.length || 0;
      const approvedCount = recentData.data?.filter((req: ApprovalRequest) => req.status === 'approved').length || 0;
      const rejectedCount = recentData.data?.filter((req: ApprovalRequest) => req.status === 'rejected').length || 0;
      
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: recentData.data?.length || 0
      });

    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Bekliyor' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, text: 'Devam Ediyor' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Onaylandı' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Reddedildi' },
      revision_required: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, text: 'Revizyon Gerekli' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_approval;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleQuickAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await workflows.approveStep({ request_id: requestId, comments: 'Hızlı onay' });
      } else {
        await workflows.rejectStep({ request_id: requestId, comments: 'Hızlı red' });
      }
      
      await loadDashboardData(); // Verileri yenile
    } catch (error) {
      console.error('Aksiyon gerçekleştirilirken hata:', error);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Onay Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Risk onay süreçlerini yönetin ve takip edin
          </p>
        </div>
        <Button onClick={loadDashboardData}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen Onaylar</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylanan</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reddedilen</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Bekleyen Onaylar</TabsTrigger>
          <TabsTrigger value="mytasks">Görevlerim</TabsTrigger>
          <TabsTrigger value="recent">Son Onaylar</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Bekleyen Risk Onayları
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Risk ID: {approval.entity_id}</span>
                        </div>
                        {getStatusBadge(approval.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Talep Eden:</span>
                          <p>{approval.requested_by}</p>
                        </div>
                        <div>
                          <span className="font-medium">Talep Tarihi:</span>
                          <p>{new Date(approval.requested_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Mevcut Adım:</span>
                          <p>{approval.current_step}</p>
                        </div>
                        <div>
                          <span className="font-medium">Workflow ID:</span>
                          <p className="truncate">{approval.workflow_id}</p>
                        </div>
                      </div>

                      {canApprove && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleQuickAction(approval.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Hızlı Onay
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleQuickAction(approval.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Hızlı Red
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen Onay Yok</h3>
                  <p className="text-gray-600">
                    Şu anda bekleyen risk onayı bulunmuyor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mytasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Benim Görevlerim
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myTasks.length > 0 ? (
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{task.entity_title || `Risk ${task.entity_id}`}</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Adım {task.step_order}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Workflow:</span>
                          <p>{task.workflow_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Adım:</span>
                          <p>{task.step_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Talep Tarihi:</span>
                          <p>{new Date(task.requested_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleQuickAction(task.request_id, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleQuickAction(task.request_id, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Detaylar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Görev Yok</h3>
                  <p className="text-gray-600">
                    Şu anda size atanmış görev bulunmuyor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Son Onaylar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentApprovals.length > 0 ? (
                <div className="space-y-4">
                  {recentApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Risk ID: {approval.entity_id}</span>
                        </div>
                        {getStatusBadge(approval.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Talep Eden:</span>
                          <p>{approval.requested_by}</p>
                        </div>
                        <div>
                          <span className="font-medium">Talep Tarihi:</span>
                          <p>{new Date(approval.requested_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Tamamlanma:</span>
                          <p>{approval.completed_at ? new Date(approval.completed_at).toLocaleDateString('tr-TR') : 'Devam ediyor'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Durum:</span>
                          <p>{approval.status.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Onay Geçmişi Yok</h3>
                  <p className="text-gray-600">
                    Henüz onay geçmişi bulunmuyor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskApprovalDashboard;
