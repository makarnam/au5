import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuthStore } from '../../store/authStore';
import { riskService } from '../../services/riskService';
import { workflows } from '../../services/workflows';
import { Risk, Workflow, WorkflowStep, ApprovalRequest } from '../../types';
import { Plus, Settings, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface RiskWorkflowManagerProps {
  riskId?: string;
}

const RiskWorkflowManager: React.FC<RiskWorkflowManagerProps> = ({ riskId }) => {
  const { user, checkPermission } = useAuthStore();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [currentApproval, setCurrentApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const canManageWorkflows = checkPermission(['admin', 'super_admin', 'risk_manager']);
  const canApprove = checkPermission(['admin', 'super_admin', 'risk_manager', 'supervisor']);

  useEffect(() => {
    if (riskId) {
      loadRiskData();
    }
  }, [riskId]);

  const loadRiskData = async () => {
    if (!riskId) return;
    
    try {
      setLoading(true);
      const [riskData, workflowsData, approvalData] = await Promise.all([
        riskService.getRisk(riskId),
        workflows.getWorkflows({ entity_type: 'risk' }),
        workflows.getInstances({ entity_type: 'risk', entity_id: riskId })
      ]);

      setRisk(riskData);
      setAvailableWorkflows(workflowsData.data || []);
      
      // Mevcut onay sürecini bul
      const currentApprovalRequest = approvalData.data?.find(
        (req: ApprovalRequest) => req.status === 'pending_approval' || req.status === 'in_progress'
      );
      setCurrentApproval(currentApprovalRequest || null);
    } catch (error) {
      console.error('Risk workflow data yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async (workflowId: string) => {
    if (!riskId) return;
    
    try {
      const result = await workflows.startWorkflow({
        entity_type: 'risk',
        entity_id: riskId,
        workflow_id: workflowId
      });
      
      if (result.data) {
        await loadRiskData(); // Verileri yenile
      }
    } catch (error) {
      console.error('Workflow başlatılırken hata:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      revision_required: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_approval;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
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
          <h2 className="text-2xl font-bold text-gray-900">Risk Onay Süreci</h2>
          <p className="text-gray-600 mt-1">
            {risk?.title} için onay süreçlerini yönetin
          </p>
        </div>
        {canManageWorkflows && (
          <Button onClick={() => setActiveTab('workflows')}>
            <Settings className="w-4 h-4 mr-2" />
            Workflow Yönetimi
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="current">Mevcut Süreç</TabsTrigger>
          <TabsTrigger value="history">Geçmiş</TabsTrigger>
          {canManageWorkflows && (
            <TabsTrigger value="workflows">Workflow'lar</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Risk Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Risk Seviyesi</p>
                  <Badge className={`mt-1 ${
                    risk?.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                    risk?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk?.risk_level?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Onay Durumu</p>
                  <div className="mt-1">
                    {currentApproval ? (
                      getStatusBadge(currentApproval.status)
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Onay Gerekmiyor</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!currentApproval && canManageWorkflows && (
            <Card>
              <CardHeader>
                <CardTitle>Onay Süreci Başlat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <Button 
                        onClick={() => startWorkflow(workflow.id)}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Başlat
                      </Button>
                    </div>
                  ))}
                  {availableWorkflows.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Bu risk için uygun workflow bulunamadı.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          {currentApproval ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Mevcut Onay Süreci
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Durum:</span>
                    {getStatusBadge(currentApproval.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Talep Eden:</span>
                    <span className="text-sm">{currentApproval.requested_by}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Talep Tarihi:</span>
                    <span className="text-sm">
                      {new Date(currentApproval.requested_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  
                  {canApprove && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Onay Aksiyonları</h4>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Revizyon İste
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aktif Onay Süreci Yok</h3>
                <p className="text-gray-600">
                  Bu risk için şu anda aktif bir onay süreci bulunmuyor.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onay Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-4">
                Onay geçmişi burada görüntülenecek.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageWorkflows && (
          <TabsContent value="workflows" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Workflow Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableWorkflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {workflow.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Users className="w-4 h-4 mr-1" />
                          Adımları Görüntüle
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Workflow Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RiskWorkflowManager;
