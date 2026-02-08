import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, HardDrive, Shield, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Calendar, Tag, MapPin, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'active' | 'maintenance' | 'retired' | 'disposed';
  lifecycle_stage: 'acquisition' | 'deployment' | 'operation' | 'maintenance' | 'retirement' | 'disposal';
  security_posture: 'compliant' | 'non_compliant' | 'at_risk' | 'critical';
  location: string;
  owner: string;
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
  next_maintenance: string;
  risk_score: number;
  compliance_status: string[];
  created_at: string;
  updated_at: string;
}

interface AssetLifecycleEvent {
  id: string;
  asset_id: string;
  event_type: 'acquisition' | 'deployment' | 'maintenance' | 'security_update' | 'retirement' | 'disposal';
  description: string;
  performed_by: string;
  performed_at: string;
  cost?: number;
  notes?: string;
}

const AssetLifecycleManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [lifecycleEvents, setLifecycleEvents] = useState<AssetLifecycleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSecurity, setFilterSecurity] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    location: '',
    owner: '',
    purchase_date: '',
    warranty_expiry: '',
    risk_score: 0,
  });

  const [eventFormData, setEventFormData] = useState({
    event_type: 'maintenance' as AssetLifecycleEvent['event_type'],
    description: '',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    loadAssets();
  }, [filterStatus, filterCategory, filterSecurity]);

  useEffect(() => {
    if (selectedAsset) {
      loadLifecycleEvents(selectedAsset.id);
    }
  }, [selectedAsset]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'Dell Server X1',
          type: 'Server',
          category: 'IT Infrastructure',
          status: 'active',
          lifecycle_stage: 'operation',
          security_posture: 'compliant',
          location: 'Data Center A',
          owner: 'IT Department',
          purchase_date: '2023-01-15',
          warranty_expiry: '2026-01-15',
          last_maintenance: '2024-06-15',
          next_maintenance: '2024-12-15',
          risk_score: 25,
          compliance_status: ['ISO 27001', 'SOX'],
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2024-06-15T14:30:00Z',
        },
        {
          id: '2',
          name: 'Cisco Firewall FW-500',
          type: 'Network Security',
          category: 'Security Assets',
          status: 'maintenance',
          lifecycle_stage: 'maintenance',
          security_posture: 'at_risk',
          location: 'Network Room B',
          owner: 'Security Team',
          purchase_date: '2022-08-20',
          warranty_expiry: '2025-08-20',
          last_maintenance: '2024-08-01',
          next_maintenance: '2024-11-01',
          risk_score: 75,
          compliance_status: ['PCI DSS', 'ISO 27001'],
          created_at: '2022-08-20T09:00:00Z',
          updated_at: '2024-08-01T11:15:00Z',
        },
        {
          id: '3',
          name: 'AWS EC2 Instance i-12345',
          type: 'Cloud Server',
          category: 'Cloud Assets',
          status: 'active',
          lifecycle_stage: 'operation',
          security_posture: 'critical',
          location: 'AWS us-east-1',
          owner: 'DevOps Team',
          purchase_date: '2023-03-10',
          warranty_expiry: '2025-03-10',
          last_maintenance: '2024-07-20',
          next_maintenance: '2024-10-20',
          risk_score: 90,
          compliance_status: ['SOC 2', 'ISO 27001'],
          created_at: '2023-03-10T08:30:00Z',
          updated_at: '2024-07-20T16:45:00Z',
        }
      ];

      let filteredAssets = mockAssets;

      if (filterStatus !== 'all') {
        filteredAssets = filteredAssets.filter(asset => asset.status === filterStatus);
      }
      if (filterCategory !== 'all') {
        filteredAssets = filteredAssets.filter(asset => asset.category === filterCategory);
      }
      if (filterSecurity !== 'all') {
        filteredAssets = filteredAssets.filter(asset => asset.security_posture === filterSecurity);
      }

      setAssets(filteredAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadLifecycleEvents = async (assetId: string) => {
    try {
      // Mock lifecycle events
      const mockEvents: AssetLifecycleEvent[] = [
        {
          id: '1',
          asset_id: assetId,
          event_type: 'acquisition',
          description: 'Asset acquired and registered in system',
          performed_by: 'IT Procurement',
          performed_at: '2023-01-15T10:00:00Z',
          cost: 5000,
          notes: 'Standard procurement process'
        },
        {
          id: '2',
          asset_id: assetId,
          event_type: 'deployment',
          description: 'Asset deployed to production environment',
          performed_by: 'IT Operations',
          performed_at: '2023-01-20T14:30:00Z',
          notes: 'Successfully deployed and tested'
        },
        {
          id: '3',
          asset_id: assetId,
          event_type: 'maintenance',
          description: 'Regular maintenance and security updates',
          performed_by: 'IT Maintenance',
          performed_at: '2024-06-15T09:15:00Z',
          cost: 200,
          notes: 'Firmware updated, security patches applied'
        }
      ];

      setLifecycleEvents(mockEvents.filter(event => event.asset_id === assetId));
    } catch (error) {
      console.error('Error loading lifecycle events:', error);
      toast.error('Failed to load lifecycle events');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      category: '',
      location: '',
      owner: '',
      purchase_date: '',
      warranty_expiry: '',
      risk_score: 0,
    });
    setEditingAsset(null);
  };

  const resetEventForm = () => {
    setEventFormData({
      event_type: 'maintenance',
      description: '',
      cost: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    try {
      if (editingAsset) {
        // Update asset
        toast.success('Asset updated successfully');
      } else {
        // Create asset
        toast.success('Asset created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      loadAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !eventFormData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    try {
      // Create lifecycle event
      toast.success('Lifecycle event recorded successfully');

      setIsEventDialogOpen(false);
      resetEventForm();
      if (selectedAsset) {
        loadLifecycleEvents(selectedAsset.id);
      }
      loadAssets();
    } catch (error) {
      console.error('Error creating lifecycle event:', error);
      toast.error('Failed to record lifecycle event');
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      category: asset.category,
      location: asset.location,
      owner: asset.owner,
      purchase_date: asset.purchase_date,
      warranty_expiry: asset.warranty_expiry,
      risk_score: asset.risk_score,
    });
    setIsDialogOpen(true);
  };

  const handleViewLifecycle = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      // Delete asset
      toast.success('Asset deleted successfully');
      loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'disposed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityColor = (posture: string) => {
    switch (posture) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLifecycleIcon = (stage: string) => {
    switch (stage) {
      case 'acquisition': return <Plus className="h-4 w-4" />;
      case 'deployment': return <CheckCircle className="h-4 w-4" />;
      case 'operation': return <Activity className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'retirement': return <XCircle className="h-4 w-4" />;
      case 'disposal': return <Trash2 className="h-4 w-4" />;
      default: return <HardDrive className="h-4 w-4" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'acquisition': return <Plus className="h-4 w-4 text-blue-600" />;
      case 'deployment': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'security_update': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'retirement': return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'disposal': return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const categories = ['IT Infrastructure', 'Security Assets', 'Network Assets', 'Cloud Assets', 'Data Assets', 'Physical Assets'];
  const securityPostures = ['compliant', 'non_compliant', 'at_risk', 'critical'];
  const statuses = ['active', 'maintenance', 'retired', 'disposed'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Asset Lifecycle Management
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>
          </h2>
          <p className="text-gray-600">Manage asset lifecycle with security posture tracking</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Asset Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter asset name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Asset Type</label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Server, Firewall, Database"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Physical or cloud location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <Input
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Department or person responsible"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.risk_score}
                    onChange={(e) => setFormData({ ...formData, risk_score: parseInt(e.target.value) || 0 })}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Purchase Date</label>
                  <Input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Warranty Expiry</label>
                  <Input
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAsset ? 'Update' : 'Create'} Asset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Posture</label>
              <Select value={filterSecurity} onValueChange={setFilterSecurity}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Postures</SelectItem>
                  {securityPostures.map(posture => (
                    <SelectItem key={posture} value={posture}>
                      {posture.charAt(0).toUpperCase() + posture.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          {selectedAsset && <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>}
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lifecycle Stage</TableHead>
                      <TableHead>Security Posture</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.type}</div>
                        </TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLifecycleIcon(asset.lifecycle_stage)}
                            <span className="capitalize">{asset.lifecycle_stage}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSecurityColor(asset.security_posture)}>
                            {asset.security_posture.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{asset.risk_score}</span>
                            {asset.risk_score > 70 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(asset)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewLifecycle(asset)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(asset.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {assets.length === 0 && !loading && (
                <div className="text-center py-12">
                  <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding your first asset to the lifecycle management system.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Asset
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {selectedAsset && (
          <TabsContent value="lifecycle" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      Lifecycle: {selectedAsset.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Track lifecycle events and security posture
                    </p>
                  </div>
                  <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetEventForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Lifecycle Event</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEventSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Event Type</label>
                          <Select
                            value={eventFormData.event_type}
                            onValueChange={(value) => setEventFormData({ ...eventFormData, event_type: value as AssetLifecycleEvent['event_type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acquisition">Acquisition</SelectItem>
                              <SelectItem value="deployment">Deployment</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="security_update">Security Update</SelectItem>
                              <SelectItem value="retirement">Retirement</SelectItem>
                              <SelectItem value="disposal">Disposal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Description *</label>
                          <Textarea
                            value={eventFormData.description}
                            onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                            placeholder="Describe the lifecycle event"
                            rows={3}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Cost</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={eventFormData.cost}
                              onChange={(e) => setEventFormData({ ...eventFormData, cost: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={eventFormData.notes}
                            onChange={(e) => setEventFormData({ ...eventFormData, notes: e.target.value })}
                            placeholder="Additional notes"
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Record Event
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Asset Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getLifecycleIcon(selectedAsset.lifecycle_stage)}
                      <span className="text-sm font-medium">Current Stage</span>
                    </div>
                    <p className="text-lg font-semibold capitalize">{selectedAsset.lifecycle_stage}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Security Posture</span>
                    </div>
                    <Badge className={getSecurityColor(selectedAsset.security_posture)}>
                      {selectedAsset.security_posture.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Risk Score</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedAsset.risk_score}/100</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Next Maintenance</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {new Date(selectedAsset.next_maintenance).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Lifecycle Events */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Lifecycle Events</h3>
                  {lifecycleEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Events Recorded</h4>
                      <p className="text-gray-600 mb-4">
                        Start tracking the asset lifecycle by adding the first event.
                      </p>
                      <Button onClick={() => setIsEventDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lifecycleEvents.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getEventIcon(event.event_type)}
                              <div className="flex-1">
                                <h4 className="font-medium capitalize">{event.event_type.replace('_', ' ')}</h4>
                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>By {event.performed_by}</span>
                                  <span>{new Date(event.performed_at).toLocaleDateString()}</span>
                                  {event.cost && <span>${event.cost}</span>}
                                </div>
                                {event.notes && (
                                  <p className="text-sm text-gray-600 mt-2 italic">{event.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AssetLifecycleManager;