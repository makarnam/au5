import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  Target,
  Building,
  FileText,
  Plus,
  X,
  Sparkles,
  Eye,
  Info,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import { supabase } from "../lib/supabase";
import { reportDataIntegrationService } from "../services/reportDataIntegrationService";

interface GrcEntity {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  audit_type?: string;
  severity?: string;
  level?: string;
  risk_level?: string;
  business_unit?: string;
  business_unit_id?: string;
  audit_id?: string;
  control_type?: string;
  audit_title?: string;
  created_at: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  due_date?: string;
  lead_auditor?: string;
  owner?: string;
  owner_id?: string;
}

interface EntitySelection {
  entityType: 'audit' | 'risk' | 'finding' | 'control' | 'general';
  entityId: string;
  entityData: GrcEntity;
  relatedFindings: GrcEntity[];
  relatedRisks: GrcEntity[];
  relatedControls: GrcEntity[];
}

interface ReportEntitySelectorProps {
  onEntitySelected: (selection: EntitySelection) => void;
  selectedEntity?: EntitySelection;
  className?: string;
}

export const ReportEntitySelector: React.FC<ReportEntitySelectorProps> = ({
  onEntitySelected,
  selectedEntity,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<'selection' | 'related'>('selection');
  const [entities, setEntities] = useState<{ [key: string]: GrcEntity[] }>({
    audits: [],
    risks: [],
    findings: [],
    controls: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEntityData, setSelectedEntityData] = useState<EntitySelection | null>(selectedEntity || null);
  const [relatedEntities, setRelatedEntities] = useState({
    findings: [] as GrcEntity[],
    risks: [] as GrcEntity[],
    controls: [] as GrcEntity[],
  });
  const [autoSelectRelated, setAutoSelectRelated] = useState(true);

  // Load entities from database
  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      console.log('Starting to load entities...');

      // Load audits
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('id, title, description, status, audit_type, business_unit_id, start_date, end_date, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (auditsError) {
        console.error('Error loading audits:', auditsError);
      } else {
        console.log('Loaded audits:', audits?.length || 0);
      }

      // Load risks
      const { data: risks, error: risksError } = await supabase
        .from('risks')
        .select('id, title, description, status, risk_level, business_unit_id, owner_id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (risksError) {
        console.error('Error loading risks:', risksError);
      } else {
        console.log('Loaded risks:', risks?.length || 0);
      }

      // Load findings
      const { data: findings, error: findingsError } = await supabase
        .from('findings')
        .select('id, title, description, status, severity, audit_id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (findingsError) {
        console.error('Error loading findings:', findingsError);
      } else {
        console.log('Loaded findings:', findings?.length || 0);
      }

      // Load controls
      const { data: controls, error: controlsError } = await supabase
        .from('controls')
        .select('id, title, description, status, control_type, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (controlsError) {
        console.error('Error loading controls:', controlsError);
      } else {
        console.log('Loaded controls:', controls?.length || 0);
      }

      // Enrich data with related information
      const enrichedAudits = await Promise.all(
        (audits || []).map(async (audit) => {
          const { data: businessUnit } = await supabase
            .from('business_units')
            .select('name')
            .eq('id', audit.business_unit_id)
            .single();

          return {
            ...audit,
            business_unit: businessUnit?.name || 'Unknown',
            title: audit.title || `Audit ${audit.id}`,
          };
        })
      );

      const enrichedRisks = await Promise.all(
        (risks || []).map(async (risk) => {
          const { data: businessUnit } = await supabase
            .from('business_units')
            .select('name')
            .eq('id', risk.business_unit_id)
            .single();

          const { data: owner } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', risk.owner_id)
            .single();

          return {
            ...risk,
            business_unit: businessUnit?.name || 'Unknown',
            owner: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
            title: risk.title || `Risk ${risk.id}`,
          };
        })
      );

      const enrichedFindings = await Promise.all(
        (findings || []).map(async (finding) => {
          const { data: audit } = await supabase
            .from('audits')
            .select('title')
            .eq('id', finding.audit_id)
            .single();

          return {
            ...finding,
            audit_title: audit?.title || 'Unknown Audit',
            title: finding.title || `Finding ${finding.id}`,
          };
        })
      );

      const enrichedControls = (controls || []).map(control => ({
        ...control,
        name: control.title || `Control ${control.id}`,
      }));

      setEntities({
        audits: enrichedAudits,
        risks: enrichedRisks,
        findings: enrichedFindings,
        controls: enrichedControls,
      });
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySelect = async (entityType: string, entity: GrcEntity) => {
    const selection: EntitySelection = {
      entityType: entityType as any,
      entityId: entity.id,
      entityData: entity,
      relatedFindings: [],
      relatedRisks: [],
      relatedControls: [],
    };

    // Load related entities based on selection
    if (entityType === 'audit') {
      const findings = entities.findings.filter(f => f.audit_id === entity.id);
      const risks = entities.risks.filter(r => r.business_unit_id === (entity as any).business_unit_id);
      const controls = entities.controls; // All controls could be related

      selection.relatedFindings = findings;
      selection.relatedRisks = risks;
      selection.relatedControls = controls;
    } else if (entityType === 'risk') {
      const controls = entities.controls; // Controls that mitigate this risk
      selection.relatedControls = controls;
    } else if (entityType === 'finding') {
      const audit = entities.audits.find(a => a.id === (entity as any).audit_id);
      if (audit) {
        const findings = entities.findings.filter(f => f.audit_id === audit.id);
        const risks = entities.risks.filter(r => r.business_unit_id === (audit as any).business_unit_id);

        selection.relatedFindings = findings;
        selection.relatedRisks = risks;
        selection.relatedControls = entities.controls;
      }
    }

    setSelectedEntityData(selection);
    setRelatedEntities({
      findings: selection.relatedFindings,
      risks: selection.relatedRisks,
      controls: selection.relatedControls,
    });

    // Auto-select related entities if enabled
    if (autoSelectRelated && entityType === 'audit') {
      setActiveTab('related');
    }
  };

  const handleConfirmSelection = () => {
    if (selectedEntityData) {
      onEntitySelected(selectedEntityData);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'audits':
        return <Search className="w-4 h-4" />;
      case 'risks':
        return <AlertTriangle className="w-4 h-4" />;
      case 'findings':
        return <Target className="w-4 h-4" />;
      case 'controls':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'effective':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'audits':
        return 'Audits';
      case 'risks':
        return 'Risk Assessments';
      case 'findings':
        return 'Findings';
      case 'controls':
        return 'Controls';
      default:
        return type;
    }
  };

  const filteredEntities = (type: string) => {
    let filtered = entities[type] || [];

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(entity => {
        const title = (entity.title || entity.name || '').toLowerCase();
        const description = (entity.description || '').toLowerCase();
        const status = (entity.status || '').toLowerCase();
        const auditType = (entity.audit_type || '').toLowerCase();
        const severity = (entity.severity || '').toLowerCase();
        const riskLevel = (entity.risk_level || entity.level || '').toLowerCase();
        const businessUnit = (entity.business_unit || '').toLowerCase();

        return title.includes(query) ||
               description.includes(query) ||
               status.includes(query) ||
               auditType.includes(query) ||
               severity.includes(query) ||
               riskLevel.includes(query) ||
               businessUnit.includes(query);
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(entity => entity.status === filterStatus);
    }

    return filtered;
  };

  const renderEntityCard = (entity: GrcEntity, type: string) => (
    <motion.div
      key={entity.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        selectedEntityData?.entityId === entity.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => handleEntitySelect(type, entity)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getEntityIcon(type)}
          <h4 className="font-medium text-gray-900">
            {entity.title || entity.name}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          {entity.status && (
            <Badge className={getStatusColor(entity.status)}>
              {entity.status}
            </Badge>
          )}
          {selectedEntityData?.entityId === entity.id && (
            <CheckCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>
      </div>

      {entity.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {entity.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {entity.audit_type && (
            <span className="flex items-center">
              <Building className="w-3 h-3 mr-1" />
              {entity.audit_type}
            </span>
          )}
          {entity.business_unit && (
            <span className="flex items-center">
              <Building className="w-3 h-3 mr-1" />
              {entity.business_unit}
            </span>
          )}
          {entity.severity && (
            <span className="flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {entity.severity}
            </span>
          )}
          {(entity.risk_level || entity.level) && (
            <span className="flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {entity.risk_level || entity.level}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {entity.start_date && (
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(entity.start_date).toLocaleDateString()}
            </span>
          )}
          <span>
            {new Date(entity.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Entity Selection
          </div>
          {selectedEntityData && (
            <Button onClick={handleConfirmSelection} size="sm">
              Confirm Selection
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select a GRC entity to base your report on
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="selection">Entity Selection</TabsTrigger>
            <TabsTrigger value="related" disabled={!selectedEntityData}>
              Related Items {selectedEntityData && `(${relatedEntities.findings.length + relatedEntities.risks.length + relatedEntities.controls.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="selection" className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search entities by title, description, status, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Searching for: "{searchQuery}" • Found results in multiple fields
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="statusFilter">Status Filter</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entity Type Tabs */}
            <Tabs defaultValue="audits" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="audits" className="flex items-center">
                  <Search className="w-4 h-4 mr-1" />
                  Audits ({filteredEntities('audits').length})
                </TabsTrigger>
                <TabsTrigger value="risks" className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Risks ({filteredEntities('risks').length})
                </TabsTrigger>
                <TabsTrigger value="findings" className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Findings ({filteredEntities('findings').length})
                </TabsTrigger>
                <TabsTrigger value="controls" className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Controls ({filteredEntities('controls').length})
                </TabsTrigger>
              </TabsList>

              {/* Entity Lists */}
              {['audits', 'risks', 'findings', 'controls'].map((type) => (
                <TabsContent key={type} value={type} className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      {getEntityIcon(type)}
                      <span className="ml-2">{getEntityTypeLabel(type)}</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select a {getEntityTypeLabel(type).toLowerCase().slice(0, -1)} to base your report on
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Clock className="w-6 h-6 animate-spin mr-2" />
                      Loading {getEntityTypeLabel(type).toLowerCase()}...
                    </div>
                  ) : filteredEntities(type).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No {getEntityTypeLabel(type).toLowerCase()} found</p>
                      <p className="text-sm">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Create some entities first'}
                      </p>
                    </div>
                  ) : (
                    <div className="h-96 overflow-y-auto">
                      <div className="space-y-3">
                        {filteredEntities(type).map((entity) => renderEntityCard(entity, type))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            {selectedEntityData && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Selected Entity</h3>
                  <div className="flex items-center space-x-2">
                    {getEntityIcon(selectedEntityData.entityType + 's')}
                    <span className="font-medium">
                      {selectedEntityData.entityData.title || selectedEntityData.entityData.name}
                    </span>
                    <Badge className={getStatusColor(selectedEntityData.entityData.status || '')}>
                      {selectedEntityData.entityData.status}
                    </Badge>
                  </div>
                  {selectedEntityData.entityData.description && (
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedEntityData.entityData.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSelectRelated"
                      checked={autoSelectRelated}
                      onChange={(e) => setAutoSelectRelated(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="autoSelectRelated" className="text-sm">
                      Auto-include related items
                    </Label>
                  </div>
                  <Button onClick={handleConfirmSelection} size="sm">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate Report with AI
                  </Button>
                </div>

                {/* Related Findings */}
                {relatedEntities.findings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Related Findings ({relatedEntities.findings.length})
                    </h4>
                    <div className="h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {relatedEntities.findings.map((finding) => (
                          <div key={finding.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{finding.title}</div>
                              <div className="text-xs text-gray-600 flex items-center space-x-2">
                                <Badge className={getStatusColor(finding.severity || '')}>
                                  {finding.severity}
                                </Badge>
                                <span>{finding.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Risks */}
                {relatedEntities.risks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Related Risks ({relatedEntities.risks.length})
                    </h4>
                    <div className="h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {relatedEntities.risks.map((risk) => (
                          <div key={risk.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{risk.title}</div>
                              <div className="text-xs text-gray-600 flex items-center space-x-2">
                                <Badge className={getStatusColor(risk.level || '')}>
                                  {risk.level}
                                </Badge>
                                <span>{risk.business_unit}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Controls */}
                {relatedEntities.controls.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Related Controls ({relatedEntities.controls.length})
                    </h4>
                    <div className="h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {relatedEntities.controls.map((control) => (
                          <div key={control.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{control.name}</div>
                              <div className="text-xs text-gray-600 flex items-center space-x-2">
                                <Badge className={getStatusColor(control.status || '')}>
                                  {control.status}
                                </Badge>
                                <span>{(control as any).control_type || 'General'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportEntitySelector;