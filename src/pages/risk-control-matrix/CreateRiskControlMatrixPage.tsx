import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import riskControlMatrixService from '../../services/riskControlMatrixService';
import { supabase } from '../../lib/supabase';

const CreateRiskControlMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    matrix_type: '5x5' as '3x3' | '4x4' | '5x5',
    industry: 'none',
    framework_id: 'none',
    business_unit_id: 'none',
    risk_categories: [] as string[],
    control_categories: [] as string[]
  });

  const [businessUnits, setBusinessUnits] = useState<Array<{id: string, name: string}>>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    loadBusinessUnits();
    loadComplianceFrameworks();
  }, []);

  const loadBusinessUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('business_units')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setBusinessUnits(data || []);
    } catch (error) {
      console.error('Error loading business units:', error);
    }
  };

  const loadComplianceFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_frameworks')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setComplianceFrameworks(data || []);
    } catch (error) {
      console.error('Error loading compliance frameworks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Matrix name is required');
      return;
    }

    if (formData.business_unit_id === 'none' && businessUnits.length === 0) {
      toast.error('No business units available. Please create a business unit first.');
      return;
    }

    try {
      const matrixData = {
        name: formData.name,
        description: formData.description,
        matrix_type: formData.matrix_type,
        risk_levels: ['low', 'medium', 'high', 'critical'],
        control_effectiveness_levels: ['excellent', 'good', 'adequate', 'weak', 'inadequate'],
        business_unit_id: formData.business_unit_id === 'none' ? businessUnits[0]?.id : formData.business_unit_id,
        framework_id: formData.framework_id === 'none' ? undefined : formData.framework_id
      };

      console.log('Creating matrix with data:', matrixData);
      await riskControlMatrixService.createMatrix(matrixData);
      toast.success('Risk Control Matrix created successfully');
      navigate('/risk-control-matrix');
    } catch (error) {
      console.error('Error creating matrix:', error);
      toast.error(`Failed to create matrix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBack = () => {
    navigate('/risk-control-matrix');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Risk Control Matrix
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">Create New Risk Control Matrix</h1>
        <p className="text-gray-600 mt-2">Set up a new risk control matrix for your organization</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Matrix Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter matrix name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter matrix description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="matrix_type">Matrix Type</Label>
                <Select 
                  value={formData.matrix_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, matrix_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3x3">3x3 Matrix</SelectItem>
                    <SelectItem value="4x4">4x4 Matrix</SelectItem>
                    <SelectItem value="5x5">5x5 Matrix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business_unit">Business Unit</Label>
                <Select 
                  value={formData.business_unit_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, business_unit_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {businessUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="framework">Framework</Label>
                <Select 
                  value={formData.framework_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, framework_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {complianceFrameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>{framework.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Create Matrix
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleBack}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRiskControlMatrixPage;
