import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartySecurityMonitoring } from '../../types/thirdPartyRiskManagement';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Edit, 
  Plus, 
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  Calendar,
  Download,
  Zap,
  Lock,
  Unlock,
  Server,
  Network
} from 'lucide-react';

const service = new ThirdPartyRiskManagementService();

const SecurityMonitoring: React.FC = () => {
  const [securityData, setSecurityData] = useState<ThirdPartySecurityMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedThirdParty, setSelectedThirdParty] = useState<string>('');
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState<ThirdPartySecurityMonitoring | null>(null);

  // Form state for creating security monitoring records
  const [formData, setFormData] = useState({
    third_party_id: '',
    monitoring_type: 'continuous' as const,
    monitoring_date: new Date().toISOString().split('T')[0],
    security_score: 0,
    risk_level: 'medium' as const,
    security_controls_assessed: 0,
    security_controls_compliant: 0,
    compliance_percentage: 0,
    vulnerabilities_found: 0,
    critical_vulnerabilities: 0,
    high_vulnerabilities: 0,
    medium_vulnerabilities: 0,
    low_vulnerabilities: 0,
    security_incidents: 0,
    data_breaches: 0,
    security_certifications: [] as string[],
    security_assessments: [] as string[],
    penetration_testing_results: '',
    security_audit_results: '',
    compliance_gaps: [] as string[],
    remediation_actions: [] as string[],
    follow_up_required: false,
    follow_up_date: '',
    automated_monitoring_enabled: false,
    monitoring_tools: [] as string[],
    alert_thresholds: '',
    incident_response_plan: '',
    business_continuity_plan: '',
    disaster_recovery_plan: '',
    insurance_coverage: ''
  });

  useEffect(() => {
    loadSecurityData();
    loadThirdParties();
  }, [page, selectedThirdParty]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const result = await service.getSecurityMonitoring(selectedThirdParty, page, limit);
      if (result.error) {
        console.error('Error loading security data:', result.error);
      } else {
        setSecurityData(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThirdParties = async () => {
    try {
      const result = await service.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (error) {
      console.error('Error loading third parties:', error);
    }
  };

  const handleCreateSecurityMonitoring = async () => {
    try {
      // Note: We need to add createSecurityMonitoring method to the service
      alert('Security monitoring creation functionality will be implemented with the service method');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating security monitoring record:', error);
      alert('Failed to create security monitoring record');
    }
  };

  const resetForm = () => {
    setFormData({
      third_party_id: '',
      monitoring_type: 'continuous',
      monitoring_date: new Date().toISOString().split('T')[0],
      security_score: 0,
      risk_level: 'medium',
      security_controls_assessed: 0,
      security_controls_compliant: 0,
      compliance_percentage: 0,
      vulnerabilities_found: 0,
      critical_vulnerabilities: 0,
      high_vulnerabilities: 0,
      medium_vulnerabilities: 0,
      low_vulnerabilities: 0,
      security_incidents: 0,
      data_breaches: 0,
      security_certifications: [],
      security_assessments: [],
      penetration_testing_results: '',
      security_audit_results: '',
      compliance_gaps: [],
      remediation_actions: [],
      follow_up_required: false,
      follow_up_date: '',
      automated_monitoring_enabled: false,
      monitoring_tools: [],
      alert_thresholds: '',
      incident_response_plan: '',
      business_continuity_plan: '',
      disaster_recovery_plan: '',
      insurance_coverage: ''
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAverageSecurityScore = () => {
    if (securityData.length === 0) return 0;
    const total = securityData.reduce((sum, item) => sum + (item.security_score || 0), 0);
    return Math.round(total / securityData.length);
  };

  const calculateTotalVulnerabilities = () => {
    return securityData.reduce((sum, item) => sum + (item.vulnerabilities_found || 0), 0);
  };

  const calculateCriticalVulnerabilities = () => {
    return securityData.reduce((sum, item) => sum + (item.critical_vulnerabilities || 0), 0);
  };

  const averageSecurityScore = calculateAverageSecurityScore();
  const totalVulnerabilities = calculateTotalVulnerabilities();
  const criticalVulnerabilities = calculateCriticalVulnerabilities();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
          <p className="text-gray-600 mt-2">Monitor third-party security posture and compliance</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Security Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="third-party-filter">Third Party</Label>
              <select
                id="third-party-filter"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedThirdParty}
                onChange={(e) => setSelectedThirdParty(e.target.value)}
              >
                <option value="">All Third Parties</option>
                {thirdParties.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Security Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Security Score</p>
                <p className={`text-2xl font-bold ${getSecurityScoreColor(averageSecurityScore)}`}>
                  {averageSecurityScore}%
                </p>
                <p className="text-xs text-gray-500">Overall security posture</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vulnerabilities</p>
                <p className="text-2xl font-bold text-orange-600">{totalVulnerabilities}</p>
                <p className="text-xs text-gray-500">Across all third parties</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Vulnerabilities</p>
                <p className="text-2xl font-bold text-red-600">{criticalVulnerabilities}</p>
                <p className="text-xs text-gray-500">Require immediate attention</p>
              </div>
              <Zap className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Assessments</p>
                <p className="text-2xl font-bold text-purple-600">{total}</p>
                <p className="text-xs text-gray-500">Total assessments</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Monitoring List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Assessments ({total})</CardTitle>
          <CardDescription>Third-party security monitoring and assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading security data...</div>
          ) : securityData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No security assessments found</div>
          ) : (
            <div className="space-y-4">
              {securityData.map((security) => (
                <div key={security.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {thirdParties.find(tp => tp.id === security.third_party_id)?.name || 'Unknown Third Party'}
                        </h3>
                        <Badge className={getRiskLevelColor(security.risk_level || 'medium')}>
                          <div className="flex items-center gap-1">
                            {getRiskLevelIcon(security.risk_level || 'medium')}
                            {(security.risk_level || 'medium').toUpperCase()}
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {security.monitoring_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {security.follow_up_required && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="w-4 h-4" />
                            FOLLOW-UP REQUIRED
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Security Score:</span> 
                          <span className={`ml-1 ${getSecurityScoreColor(security.security_score || 0)}`}>
                            {security.security_score || 0}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Compliance:</span> {security.compliance_percentage || 0}%
                        </div>
                        <div>
                          <span className="font-medium">Vulnerabilities:</span> {security.vulnerabilities_found || 0}
                        </div>
                        <div>
                          <span className="font-medium">Critical:</span> {security.critical_vulnerabilities || 0}
                        </div>
                        <div>
                          <span className="font-medium">Assessment Date:</span> {formatDate(security.monitoring_date)}
                        </div>
                        <div>
                          <span className="font-medium">Controls Assessed:</span> {security.security_controls_assessed || 0}
                        </div>
                        <div>
                          <span className="font-medium">Controls Compliant:</span> {security.security_controls_compliant || 0}
                        </div>
                        <div>
                          <span className="font-medium">Automated Monitoring:</span> {security.automated_monitoring_enabled ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSecurity(security)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Security Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Security Assessment</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="third-party-select">Third Party *</Label>
                <select
                  id="third-party-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.third_party_id}
                  onChange={(e) => setFormData({ ...formData, third_party_id: e.target.value })}
                  required
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="monitoring-type">Monitoring Type *</Label>
                <select
                  id="monitoring-type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.monitoring_type}
                  onChange={(e) => setFormData({ ...formData, monitoring_type: e.target.value as any })}
                  required
                >
                  <option value="continuous">Continuous</option>
                  <option value="periodic">Periodic</option>
                  <option value="incident_based">Incident Based</option>
                  <option value="compliance_check">Compliance Check</option>
                </select>
              </div>

              <div>
                <Label htmlFor="monitoring-date">Assessment Date *</Label>
                <Input
                  id="monitoring-date"
                  type="date"
                  value={formData.monitoring_date}
                  onChange={(e) => setFormData({ ...formData, monitoring_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="security-score">Security Score (%) *</Label>
                <Input
                  id="security-score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.security_score}
                  onChange={(e) => setFormData({ ...formData, security_score: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="risk-level">Risk Level *</Label>
                <select
                  id="risk-level"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="controls-assessed">Security Controls Assessed</Label>
                <Input
                  id="controls-assessed"
                  type="number"
                  min="0"
                  value={formData.security_controls_assessed}
                  onChange={(e) => setFormData({ ...formData, security_controls_assessed: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="controls-compliant">Security Controls Compliant</Label>
                <Input
                  id="controls-compliant"
                  type="number"
                  min="0"
                  value={formData.security_controls_compliant}
                  onChange={(e) => setFormData({ ...formData, security_controls_compliant: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="compliance-percentage">Compliance Percentage (%)</Label>
                <Input
                  id="compliance-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance_percentage}
                  onChange={(e) => setFormData({ ...formData, compliance_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="vulnerabilities-found">Total Vulnerabilities Found</Label>
                <Input
                  id="vulnerabilities-found"
                  type="number"
                  min="0"
                  value={formData.vulnerabilities_found}
                  onChange={(e) => setFormData({ ...formData, vulnerabilities_found: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="critical-vulnerabilities">Critical Vulnerabilities</Label>
                <Input
                  id="critical-vulnerabilities"
                  type="number"
                  min="0"
                  value={formData.critical_vulnerabilities}
                  onChange={(e) => setFormData({ ...formData, critical_vulnerabilities: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="high-vulnerabilities">High Vulnerabilities</Label>
                <Input
                  id="high-vulnerabilities"
                  type="number"
                  min="0"
                  value={formData.high_vulnerabilities}
                  onChange={(e) => setFormData({ ...formData, high_vulnerabilities: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="medium-vulnerabilities">Medium Vulnerabilities</Label>
                <Input
                  id="medium-vulnerabilities"
                  type="number"
                  min="0"
                  value={formData.medium_vulnerabilities}
                  onChange={(e) => setFormData({ ...formData, medium_vulnerabilities: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="low-vulnerabilities">Low Vulnerabilities</Label>
                <Input
                  id="low-vulnerabilities"
                  type="number"
                  min="0"
                  value={formData.low_vulnerabilities}
                  onChange={(e) => setFormData({ ...formData, low_vulnerabilities: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="security-incidents">Security Incidents</Label>
                <Input
                  id="security-incidents"
                  type="number"
                  min="0"
                  value={formData.security_incidents}
                  onChange={(e) => setFormData({ ...formData, security_incidents: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="data-breaches">Data Breaches</Label>
                <Input
                  id="data-breaches"
                  type="number"
                  min="0"
                  value={formData.data_breaches}
                  onChange={(e) => setFormData({ ...formData, data_breaches: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="penetration-testing-results">Penetration Testing Results</Label>
                <Textarea
                  id="penetration-testing-results"
                  value={formData.penetration_testing_results}
                  onChange={(e) => setFormData({ ...formData, penetration_testing_results: e.target.value })}
                  placeholder="Results from penetration testing"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="security-audit-results">Security Audit Results</Label>
                <Textarea
                  id="security-audit-results"
                  value={formData.security_audit_results}
                  onChange={(e) => setFormData({ ...formData, security_audit_results: e.target.value })}
                  placeholder="Results from security audits"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="follow-up-required"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  />
                  <Label htmlFor="follow-up-required">Follow-up Required</Label>
                </div>
              </div>

              {formData.follow_up_required && (
                <div>
                  <Label htmlFor="follow-up-date">Follow-up Date</Label>
                  <Input
                    id="follow-up-date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="automated-monitoring"
                    checked={formData.automated_monitoring_enabled}
                    onChange={(e) => setFormData({ ...formData, automated_monitoring_enabled: e.target.checked })}
                  />
                  <Label htmlFor="automated-monitoring">Automated Monitoring Enabled</Label>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="alert-thresholds">Alert Thresholds</Label>
                <Input
                  id="alert-thresholds"
                  value={formData.alert_thresholds}
                  onChange={(e) => setFormData({ ...formData, alert_thresholds: e.target.value })}
                  placeholder="e.g., Critical: 1, High: 5, Medium: 10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSecurityMonitoring}>
                Add Security Assessment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Detail Modal */}
      {selectedSecurity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Security Assessment Details</h2>
              <Button variant="outline" onClick={() => setSelectedSecurity(null)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Third Party:</span> {thirdParties.find(tp => tp.id === selectedSecurity.third_party_id)?.name || 'Unknown'}</div>
                  <div><span className="font-medium">Monitoring Type:</span> {selectedSecurity.monitoring_type.replace('_', ' ')}</div>
                  <div><span className="font-medium">Assessment Date:</span> {formatDate(selectedSecurity.monitoring_date)}</div>
                  <div><span className="font-medium">Risk Level:</span>
                    <Badge className={`ml-2 ${getRiskLevelColor(selectedSecurity.risk_level || 'medium')}`}>
                      {(selectedSecurity.risk_level || 'medium').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Security Metrics</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Security Score:</span> 
                    <span className={`ml-1 ${getSecurityScoreColor(selectedSecurity.security_score || 0)}`}>
                      {selectedSecurity.security_score || 0}%
                    </span>
                  </div>
                  <div><span className="font-medium">Compliance Percentage:</span> {selectedSecurity.compliance_percentage || 0}%</div>
                  <div><span className="font-medium">Controls Assessed:</span> {selectedSecurity.security_controls_assessed || 0}</div>
                  <div><span className="font-medium">Controls Compliant:</span> {selectedSecurity.security_controls_compliant || 0}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Vulnerabilities</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Total Vulnerabilities:</span> {selectedSecurity.vulnerabilities_found || 0}</div>
                  <div><span className="font-medium">Critical:</span> {selectedSecurity.critical_vulnerabilities || 0}</div>
                  <div><span className="font-medium">High:</span> {selectedSecurity.high_vulnerabilities || 0}</div>
                  <div><span className="font-medium">Medium:</span> {selectedSecurity.medium_vulnerabilities || 0}</div>
                  <div><span className="font-medium">Low:</span> {selectedSecurity.low_vulnerabilities || 0}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Incidents & Monitoring</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Security Incidents:</span> {selectedSecurity.security_incidents || 0}</div>
                  <div><span className="font-medium">Data Breaches:</span> {selectedSecurity.data_breaches || 0}</div>
                  <div><span className="font-medium">Automated Monitoring:</span> {selectedSecurity.automated_monitoring_enabled ? 'Enabled' : 'Disabled'}</div>
                  <div><span className="font-medium">Follow-up Required:</span> {selectedSecurity.follow_up_required ? 'Yes' : 'No'}</div>
                  {selectedSecurity.follow_up_required && selectedSecurity.follow_up_date && (
                    <div><span className="font-medium">Follow-up Date:</span> {formatDate(selectedSecurity.follow_up_date)}</div>
                  )}
                </div>
              </div>

              {selectedSecurity.penetration_testing_results && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Penetration Testing Results</h3>
                  <p className="text-gray-700">{selectedSecurity.penetration_testing_results}</p>
                </div>
              )}

              {selectedSecurity.security_audit_results && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Security Audit Results</h3>
                  <p className="text-gray-700">{selectedSecurity.security_audit_results}</p>
                </div>
              )}

              {selectedSecurity.compliance_gaps && selectedSecurity.compliance_gaps.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Compliance Gaps</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSecurity.compliance_gaps.map((gap, index) => (
                      <li key={index} className="text-gray-700">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSecurity.remediation_actions && selectedSecurity.remediation_actions.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Remediation Actions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedSecurity.remediation_actions.map((action, index) => (
                      <li key={index} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedSecurity(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMonitoring;
