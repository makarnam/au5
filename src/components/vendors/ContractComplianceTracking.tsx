import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Bell,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import type { ThirdPartyContract } from '../../types/thirdPartyRiskManagement';

interface ContractComplianceTrackingProps {
  vendorId?: string;
}

interface ContractAlert {
  id: string;
  contract_id: string;
  alert_type: 'renewal' | 'expiry' | 'compliance' | 'payment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  resolved_at?: string;
  due_date?: string;
}

const ContractComplianceTracking: React.FC<ContractComplianceTrackingProps> = ({ vendorId }) => {
  const [contracts, setContracts] = useState<ThirdPartyContract[]>([]);
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadContractData();
  }, [vendorId, selectedTimeframe]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      const { data, error } = await thirdPartyRiskManagementService.getContracts(vendorId);
      if (error) throw error;
      setContracts(data || []);
      generateAlerts(data || []);
    } catch (error) {
      console.error('Error loading contract data:', error);
      toast.error('Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (contracts: ThirdPartyContract[]) => {
    const newAlerts: ContractAlert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    contracts.forEach(contract => {
      // Renewal alerts
      if (contract.end_date) {
        const endDate = new Date(contract.end_date);

        if (endDate <= sevenDaysFromNow && endDate >= now) {
          newAlerts.push({
            id: `alert-${contract.id}-renewal-critical`,
            contract_id: contract.id,
            alert_type: 'renewal',
            severity: 'critical',
            title: 'Contract Expires Soon',
            description: `Contract ${contract.contract_number || contract.id} expires on ${endDate.toLocaleDateString()}`,
            status: 'active',
            created_at: now.toISOString(),
            due_date: contract.end_date
          });
        } else if (endDate <= thirtyDaysFromNow && endDate >= now) {
          newAlerts.push({
            id: `alert-${contract.id}-renewal-warning`,
            contract_id: contract.id,
            alert_type: 'renewal',
            severity: 'high',
            title: 'Contract Renewal Due',
            description: `Contract ${contract.contract_number || contract.id} expires in ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
            status: 'active',
            created_at: now.toISOString(),
            due_date: contract.end_date
          });
        }
      }

      // Expiry alerts for already expired contracts
      if (contract.end_date) {
        const endDate = new Date(contract.end_date);
        if (endDate < now) {
          newAlerts.push({
            id: `alert-${contract.id}-expired`,
            contract_id: contract.id,
            alert_type: 'expiry',
            severity: 'critical',
            title: 'Contract Expired',
            description: `Contract ${contract.contract_number || contract.id} has expired on ${endDate.toLocaleDateString()}`,
            status: 'active',
            created_at: now.toISOString(),
            due_date: contract.end_date
          });
        }
      }

      // Mock compliance alerts
      if (Math.random() < 0.2) {
        newAlerts.push({
          id: `alert-${contract.id}-compliance`,
          contract_id: contract.id,
          alert_type: 'compliance',
          severity: 'medium',
          title: 'Compliance Review Required',
          description: `Contract ${contract.contract_number || contract.id} requires compliance review`,
          status: 'active',
          created_at: now.toISOString()
        });
      }
    });

    setAlerts(newAlerts);
  };

  const refreshContractData = async () => {
    try {
      setIsRefreshing(true);
      await loadContractData();
      toast.success('Contract data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh contract data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
    toast.success('Alert acknowledged');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' as const, resolved_at: new Date().toISOString() }
        : alert
    ));
    toast.success('Alert resolved');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContractStatus = (contract: ThirdPartyContract) => {
    if (!contract.end_date) return 'active';

    const endDate = new Date(contract.end_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (endDate < now) return 'expired';
    if (endDate <= thirtyDaysFromNow) return 'expiring_soon';
    return 'active';
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'expiring_soon': return 'text-orange-600 bg-orange-100';
      case 'active': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysUntilExpiry = (contract: ThirdPartyContract) => {
    if (!contract.end_date) return null;

    const endDate = new Date(contract.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const expiringContracts = contracts.filter(c => getContractStatus(c) === 'expiring_soon');
  const expiredContracts = contracts.filter(c => getContractStatus(c) === 'expired');

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Contract Compliance Tracking
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {vendorId ? `Contract monitoring for vendor ${vendorId}` : 'Monitor contract compliance and renewals across all vendors'}
          </p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7days'>7 Days</SelectItem>
              <SelectItem value='30days'>30 Days</SelectItem>
              <SelectItem value='90days'>90 Days</SelectItem>
              <SelectItem value='1year'>1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={refreshContractData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4 mr-2' />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts Summary */}
      {activeAlerts.length > 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-900'>
              <AlertTriangle className='h-5 w-5' />
              Active Contract Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {activeAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <h4 className='font-medium text-gray-900'>{alert.title}</h4>
                      <p className='text-sm text-gray-600'>{alert.description}</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size='sm'
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
              {activeAlerts.length > 3 && (
                <p className='text-sm text-red-700 text-center'>
                  +{activeAlerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='dashboard' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='alerts'>Alerts</TabsTrigger>
          <TabsTrigger value='contracts'>Contract Details</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Contracts</p>
                    <p className='text-3xl font-bold text-gray-900'>{contracts.length}</p>
                  </div>
                  <FileText className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Active Alerts</p>
                    <p className='text-3xl font-bold text-red-600'>{activeAlerts.length}</p>
                  </div>
                  <AlertTriangle className='h-8 w-8 text-red-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Expiring Soon</p>
                    <p className='text-3xl font-bold text-orange-600'>{expiringContracts.length}</p>
                  </div>
                  <Clock className='h-8 w-8 text-orange-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Expired</p>
                    <p className='text-3xl font-bold text-red-600'>{expiredContracts.length}</p>
                  </div>
                  <XCircle className='h-8 w-8 text-red-600' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {contracts.slice(0, 6).map((contract) => {
                  const status = getContractStatus(contract);
                  const daysUntilExpiry = getDaysUntilExpiry(contract);

                  return (
                    <Card key={contract.id} className='border-l-4 border-l-blue-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <h4 className='font-medium text-gray-900'>
                            {contract.contract_number || `Contract ${contract.id.slice(0, 8)}`}
                          </h4>
                          <Badge className={getContractStatusColor(status)}>
                            {status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-gray-600'>Vendor:</span>
                            <span className='font-medium'>Vendor {contract.third_party_id.slice(0, 8)}</span>
                          </div>
                          {contract.end_date && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Expires:</span>
                              <span className='font-medium'>
                                {new Date(contract.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {daysUntilExpiry !== null && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Days left:</span>
                              <span className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-600' : daysUntilExpiry < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                                {daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='alerts' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Contract Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className='text-center py-8'>
                  <CheckCircle className='h-12 w-12 text-green-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No alerts at this time</p>
                  <p className='text-sm text-gray-400 mt-2'>All contracts are compliant</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className='font-medium'>
                          {contracts.find(c => c.id === alert.contract_id)?.contract_number || `Contract ${alert.contract_id.slice(0, 8)}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{alert.alert_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.title}</TableCell>
                        <TableCell>
                          <Badge className={getAlertStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(alert.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {alert.status === 'active' && (
                              <>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                            <Button size='sm' variant='ghost'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='contracts' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className='text-center py-8'>
                  <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No contracts found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days Until Expiry</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => {
                      const status = getContractStatus(contract);
                      const daysUntilExpiry = getDaysUntilExpiry(contract);

                      return (
                        <TableRow key={contract.id}>
                          <TableCell className='font-medium'>
                            {contract.contract_number || `Contract ${contract.id.slice(0, 8)}`}
                          </TableCell>
                          <TableCell>
                            Vendor {contract.third_party_id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getContractStatusColor(status)}>
                              {status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {daysUntilExpiry !== null ? (
                              <span className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-600' : daysUntilExpiry < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                                {daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry}
                              </span>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-1'>
                              <Button size='sm' variant='ghost'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='ghost'>
                                <Edit className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractComplianceTracking;