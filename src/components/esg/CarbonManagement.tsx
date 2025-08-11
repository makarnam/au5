import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Factory, 
  Zap, 
  Truck,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Activity,
  Calendar,
  MapPin,
  Calculator,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { CarbonManagement, CarbonScope, DataQuality, ESGVerificationStatus } from '../../types';

interface CarbonManagementProps {
  className?: string;
  programId?: string;
}

const CarbonManagement: React.FC<CarbonManagementProps> = ({ className, programId }) => {
  const [carbonData, setCarbonData] = useState<CarbonManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CarbonManagement | null>(null);
  const [formData, setFormData] = useState({
    scope: 'scope1' as CarbonScope,
    emission_source: '',
    emission_type: '',
    activity_data: 0,
    emission_factor: 0,
    co2_equivalent: 0,
    reporting_period: '',
    business_unit_id: '',
    location: '',
    methodology: '',
    data_quality: 'measured' as DataQuality,
    notes: ''
  });

  useEffect(() => {
    loadCarbonData();
  }, [programId]);

  const loadCarbonData = async () => {
    try {
      setLoading(true);
      const response = await esgService.getCarbonManagement(programId);
      setCarbonData(response.data);
    } catch (error) {
      console.error('Error loading carbon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await esgService.updateCarbonManagement(editingItem.id, formData);
      } else {
        await esgService.createCarbonManagement({
          ...formData,
          program_id: programId || '',
          currency_code: 'USD'
        });
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadCarbonData();
    } catch (error) {
      console.error('Error saving carbon data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      scope: 'scope1',
      emission_source: '',
      emission_type: '',
      activity_data: 0,
      emission_factor: 0,
      co2_equivalent: 0,
      reporting_period: '',
      business_unit_id: '',
      location: '',
      methodology: '',
      data_quality: 'measured',
      notes: ''
    });
  };

  const handleEdit = (item: CarbonManagement) => {
    setEditingItem(item);
    setFormData({
      scope: item.scope,
      emission_source: item.emission_source,
      emission_type: item.emission_type || '',
      activity_data: item.activity_data || 0,
      emission_factor: item.emission_factor || 0,
      co2_equivalent: item.co2_equivalent || 0,
      reporting_period: item.reporting_period,
      business_unit_id: item.business_unit_id || '',
      location: item.location || '',
      methodology: item.methodology || '',
      data_quality: item.data_quality,
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const getScopeIcon = (scope: CarbonScope) => {
    switch (scope) {
      case 'scope1': return <Factory className="h-4 w-4" />;
      case 'scope2': return <Zap className="h-4 w-4" />;
      case 'scope3': return <Truck className="h-4 w-4" />;
      default: return <Leaf className="h-4 w-4" />;
    }
  };

  const getScopeColor = (scope: CarbonScope) => {
    switch (scope) {
      case 'scope1': return 'bg-red-100 text-red-800';
      case 'scope2': return 'bg-blue-100 text-blue-800';
      case 'scope3': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusIcon = (status: ESGVerificationStatus) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'under_review': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateTotalEmissions = () => {
    return carbonData.reduce((total, item) => total + (item.co2_equivalent || 0), 0);
  };

  const getScopeBreakdown = () => {
    const breakdown = { scope1: 0, scope2: 0, scope3: 0 };
    carbonData.forEach(item => {
      breakdown[item.scope] += item.co2_equivalent || 0;
    });
    return breakdown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Management</h1>
          <p className="text-muted-foreground">
            Track and manage greenhouse gas emissions across all scopes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Emission Source
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTotalEmissions().toFixed(2)} tCO2e
            </div>
            <p className="text-xs text-muted-foreground">
              Total greenhouse gas emissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scope 1</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getScopeBreakdown().scope1.toFixed(2)} tCO2e
            </div>
            <p className="text-xs text-muted-foreground">
              Direct emissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scope 2</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getScopeBreakdown().scope2.toFixed(2)} tCO2e
            </div>
            <p className="text-xs text-muted-foreground">
              Indirect emissions (energy)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scope 3</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getScopeBreakdown().scope3.toFixed(2)} tCO2e
            </div>
            <p className="text-xs text-muted-foreground">
              Value chain emissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Emission Source' : 'Add Emission Source'}
            </CardTitle>
            <CardDescription>
              Enter details for the emission source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <select
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value as CarbonScope})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="scope1">Scope 1 - Direct Emissions</option>
                    <option value="scope2">Scope 2 - Energy Indirect</option>
                    <option value="scope3">Scope 3 - Value Chain</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="emission_source">Emission Source</Label>
                  <Input
                    id="emission_source"
                    value={formData.emission_source}
                    onChange={(e) => setFormData({...formData, emission_source: e.target.value})}
                    placeholder="e.g., Natural gas combustion"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emission_type">Emission Type</Label>
                  <Input
                    id="emission_type"
                    value={formData.emission_type}
                    onChange={(e) => setFormData({...formData, emission_type: e.target.value})}
                    placeholder="e.g., CO2, CH4, N2O"
                  />
                </div>

                <div>
                  <Label htmlFor="activity_data">Activity Data</Label>
                  <Input
                    id="activity_data"
                    type="number"
                    step="0.01"
                    value={formData.activity_data}
                    onChange={(e) => setFormData({...formData, activity_data: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="emission_factor">Emission Factor</Label>
                  <Input
                    id="emission_factor"
                    type="number"
                    step="0.0001"
                    value={formData.emission_factor}
                    onChange={(e) => setFormData({...formData, emission_factor: parseFloat(e.target.value) || 0})}
                    placeholder="0.0000"
                  />
                </div>

                <div>
                  <Label htmlFor="co2_equivalent">CO2 Equivalent (tCO2e)</Label>
                  <Input
                    id="co2_equivalent"
                    type="number"
                    step="0.01"
                    value={formData.co2_equivalent}
                    onChange={(e) => setFormData({...formData, co2_equivalent: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="reporting_period">Reporting Period</Label>
                  <Input
                    id="reporting_period"
                    type="text"
                    value={formData.reporting_period}
                    onChange={(e) => setFormData({...formData, reporting_period: e.target.value})}
                    placeholder="e.g., 2023"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Main facility"
                  />
                </div>

                <div>
                  <Label htmlFor="data_quality">Data Quality</Label>
                  <select
                    id="data_quality"
                    value={formData.data_quality}
                    onChange={(e) => setFormData({...formData, data_quality: e.target.value as DataQuality})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="measured">Measured</option>
                    <option value="calculated">Calculated</option>
                    <option value="estimated">Estimated</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="methodology">Methodology</Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                  placeholder="Describe the methodology used for calculation"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or comments"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Emission Sources</CardTitle>
          <CardDescription>
            Detailed breakdown of all emission sources and their data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scope</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Activity Data</th>
                  <th className="text-right p-2">Emission Factor</th>
                  <th className="text-right p-2">CO2e (t)</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Quality</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {carbonData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge className={getScopeColor(item.scope)}>
                        {getScopeIcon(item.scope)}
                        <span className="ml-1">{item.scope.toUpperCase()}</span>
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{item.emission_source}</td>
                    <td className="p-2 text-sm">{item.emission_type || '-'}</td>
                    <td className="p-2 text-right">{item.activity_data?.toFixed(2) || '-'}</td>
                    <td className="p-2 text-right">{item.emission_factor?.toFixed(4) || '-'}</td>
                    <td className="p-2 text-right font-medium">
                      {(item.co2_equivalent || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-sm">{item.location || '-'}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {item.data_quality}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {getVerificationStatusIcon(item.verification_status)}
                        <span className="ml-1 text-xs">
                          {item.verification_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonManagement;
