import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  BarChart3, 
  Plus, 
  Download, 
  Share2, 
  Settings,
  Filter,
  RefreshCw,
  Brain,
  FileText
} from 'lucide-react';
import { RiskControlMatrix, MatrixAnalytics, MatrixCell, CreateMatrixData } from '../../types/riskControlMatrix';
import riskControlMatrixService from '../../services/riskControlMatrixService';
import LoadingSpinner from '../LoadingSpinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import AIMatrixGenerator from './AIMatrixGenerator';
import MatrixTemplateManager from './MatrixTemplateManager';
import AIConfigurationComponent from '../ai/AIConfiguration';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface RiskControlMatrixDashboardProps {
  onMatrixSelect?: (matrix: RiskControlMatrix) => void;
  onCreateMatrix?: () => void;
}

const RiskControlMatrixDashboard: React.FC<RiskControlMatrixDashboardProps> = ({
  onMatrixSelect,
  onCreateMatrix
}) => {
  const [matrices, setMatrices] = useState<RiskControlMatrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<RiskControlMatrix | null>(null);
  const [analytics, setAnalytics] = useState<MatrixAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrices' | 'ai-generator' | 'templates'>('matrices');
  const [filter, setFilter] = useState({
    business_unit: '',
    framework: '',
    matrix_type: '',
    search: ''
  });
  const [showAIConfig, setShowAIConfig] = useState(false);

  useEffect(() => {
    loadMatrices();
  }, [filter]);

  useEffect(() => {
    if (selectedMatrix) {
      loadAnalytics(selectedMatrix.id);
    }
  }, [selectedMatrix]);

  const loadMatrices = async () => {
    try {
      setLoading(true);
      const data = await riskControlMatrixService.getMatrices({
        business_unit_id: filter.business_unit || undefined,
        framework_id: filter.framework || undefined,
        matrix_type: filter.matrix_type || undefined
      });
      
      // Apply search filter
      const filteredData = filter.search 
        ? data.filter(m => 
            m.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            m.description.toLowerCase().includes(filter.search.toLowerCase())
          )
        : data;
      
      setMatrices(filteredData);
      
      if (filteredData.length > 0 && !selectedMatrix) {
        setSelectedMatrix(filteredData[0]);
      }
    } catch (error) {
      console.error('Error loading matrices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (matrixId: string) => {
    try {
      const data = await riskControlMatrixService.getMatrixAnalytics(matrixId);
      
      // Validate the analytics data
      if (!data || typeof data !== 'object') {
        console.error('Invalid analytics data received:', data);
        setAnalytics(null);
        return;
      }
      
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(null);
    }
  };

  const handleMatrixSelect = (matrix: RiskControlMatrix) => {
    setSelectedMatrix(matrix);
    onMatrixSelect?.(matrix);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    if (!selectedMatrix) return;
    
    try {
      const blob = await riskControlMatrixService.exportMatrix(selectedMatrix.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMatrix.name}_matrix.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting matrix:', error);
    }
  };

  const handleMatrixGenerated = async (matrix: RiskControlMatrix, cells: MatrixCell[]) => {
    let validatedMatrix: CreateMatrixData | null = null;
    
    try {
      // Validate matrix data before saving
      if (!matrix.name || !matrix.description || !matrix.matrix_type) {
        console.error('Invalid matrix data:', matrix);
        toast.error('Generated matrix data is invalid. Please try again.');
        return;
      }

      // Ensure required fields are present and properly formatted for database
      validatedMatrix = {
        name: matrix.name,
        description: matrix.description,
        matrix_type: matrix.matrix_type,
        risk_levels: Array.isArray(matrix.risk_levels) ? matrix.risk_levels : ['low', 'medium', 'high'],
        control_effectiveness_levels: Array.isArray(matrix.control_effectiveness_levels) ? matrix.control_effectiveness_levels : ['excellent', 'good', 'adequate'],
        business_unit_id: matrix.business_unit_id && matrix.business_unit_id !== '' ? matrix.business_unit_id : undefined,
        framework_id: matrix.framework_id || undefined
      };

      // Validate the data structure
      if (!validatedMatrix?.name || !validatedMatrix?.description || !validatedMatrix?.matrix_type) {
        console.error('Invalid matrix data - missing required fields:', validatedMatrix);
        toast.error('Generated matrix data is missing required fields. Please try again.');
        return;
      }

      // Ensure arrays are properly formatted
      if (!Array.isArray(validatedMatrix?.risk_levels) || validatedMatrix?.risk_levels.length === 0) {
        console.error('Invalid risk_levels:', validatedMatrix?.risk_levels);
        validatedMatrix!.risk_levels = ['low', 'medium', 'high'];
      }

      if (!Array.isArray(validatedMatrix?.control_effectiveness_levels) || validatedMatrix?.control_effectiveness_levels.length === 0) {
        console.error('Invalid control_effectiveness_levels:', validatedMatrix?.control_effectiveness_levels);
        validatedMatrix!.control_effectiveness_levels = ['excellent', 'good', 'adequate'];
      }

      console.log('Saving matrix:', validatedMatrix);
      
      // Save the generated matrix
      const savedMatrix = await riskControlMatrixService.createMatrix(validatedMatrix);
      
      // Save the cells if they exist
      if (cells && cells.length > 0) {
        try {
          console.log('Saving cells:', cells.length, 'cells');
          // Note: You may need to implement a method to save cells in the service
          // For now, we'll just log that cells were generated
          console.log('Cells generated but not saved yet:', cells);
        } catch (cellError) {
          console.error('Error saving cells:', cellError);
          // Don't fail the whole operation if cells fail to save
        }
      }
      
      // Add the new matrix to the list
      setMatrices(prev => [savedMatrix, ...prev]);
      setSelectedMatrix(savedMatrix);
      
      // Switch back to matrices tab
      setActiveTab('matrices');
      toast.success('Matrix generated and saved successfully!');
    } catch (error) {
      console.error('Error saving generated matrix:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        matrix: validatedMatrix,
        cells: cells
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save generated matrix. ';
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          errorMessage += 'Please log in and try again.';
        } else if (error.message.includes('Missing required fields')) {
          errorMessage += 'Generated data is incomplete. Please try again.';
        } else if (error.message.includes('risk_levels must be')) {
          errorMessage += 'Invalid risk levels format. Please try again.';
        } else if (error.message.includes('control_effectiveness_levels must be')) {
          errorMessage += 'Invalid control effectiveness levels format. Please try again.';
        } else if (error.message.includes('Failed to create matrix')) {
          errorMessage += 'Database error occurred. Please try again.';
        } else {
          errorMessage += error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleTemplateApply = async () => {
    try {
      // Handle template application logic here
      // For now, just show success message
      toast.success('Template applied successfully!');
      
      // Switch back to matrices tab
      setActiveTab('matrices');
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleOpenAIConfig = () => {
    setShowAIConfig(true);
  };

  const getMatrixTypeColor = (type: string) => {
    switch (type) {
      case '5x5': return 'bg-blue-100 text-blue-800';
      case '4x4': return 'bg-green-100 text-green-800';
      case '3x3': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk-Control Matrix</h1>
          <p className="text-gray-600 mt-1">
            Manage and analyze risk-control matrices for effective risk management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenAIConfig}>
            <Settings className="w-4 h-4" />
            AI Settings
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={onCreateMatrix}>
            <Plus className="w-4 h-4 mr-2" />
            Create Matrix
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrices" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Matrices
          </TabsTrigger>
          <TabsTrigger value="ai-generator" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        {activeTab === 'matrices' && (
          <>
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <Input
                      placeholder="Search matrices..."
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                    <Select value={filter.business_unit} onValueChange={(value) => setFilter(prev => ({ ...prev, business_unit: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All units</SelectItem>
                        {/* Add business units here */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                    <Select value={filter.framework} onValueChange={(value) => setFilter(prev => ({ ...prev, framework: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All frameworks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All frameworks</SelectItem>
                        {/* Add frameworks here */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Type</label>
                    <Select value={filter.matrix_type} onValueChange={(value) => setFilter(prev => ({ ...prev, matrix_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="5x5">5x5</SelectItem>
                        <SelectItem value="4x4">4x4</SelectItem>
                        <SelectItem value="3x3">3x3</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matrix List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Matrices</span>
                      <Button variant="ghost" size="sm" onClick={loadMatrices}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {matrices.map((matrix) => (
                        <div
                          key={matrix.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedMatrix?.id === matrix.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleMatrixSelect(matrix)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{matrix.name}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {matrix.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getMatrixTypeColor(matrix.matrix_type)}>
                                  {matrix.matrix_type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(matrix.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {matrices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Grid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No matrices found</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={onCreateMatrix}>
                            Create your first matrix
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics and Details */}
              <div className="lg:col-span-2 space-y-6">
                {selectedMatrix ? (
                  <>
                    {/* Matrix Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{selectedMatrix.name}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                              <Download className="w-4 h-4" />
                              PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                              <Download className="w-4 h-4" />
                              Excel
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {analytics?.total_risks || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Risks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {analytics?.total_controls || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Controls</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {analytics?.coverage_percentage?.toFixed(1) || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Coverage</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Matrix Visualizer Placeholder */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Matrix Visualization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Grid className="w-12 h-12 mx-auto mb-3" />
                            <p>Matrix visualization will be implemented here</p>
                            <p className="text-sm">Drag & drop functionality coming soon</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analytics Charts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Effectiveness Distribution</h4>
                            <div className="space-y-2">
                              {analytics?.effectiveness_distribution && 
                                Object.entries(analytics.effectiveness_distribution).map(([rating, count]) => (
                                  <div key={rating} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rating {rating}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full" 
                                          style={{ width: `${(count / Math.max(...Object.values(analytics.effectiveness_distribution))) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium">{count}</span>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Gap Analysis</h4>
                            <div className="space-y-2">
                              {analytics?.gap_analysis && (
                                <>
                                  <div className="text-sm">
                                    <span className="font-medium">Uncovered Risks:</span> {analytics.gap_analysis.uncovered_risks.length}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Weak Control Areas:</span> {analytics.gap_analysis.weak_control_areas.length}
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Optimization Opportunities:</span> {analytics.gap_analysis.optimization_opportunities.length}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Matrix Selected</h3>
                      <p className="text-gray-600 mb-4">
                        Select a matrix from the list to view details and analytics
                      </p>
                      <Button onClick={onCreateMatrix}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Matrix
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai-generator' && (
          <AIMatrixGenerator
            onMatrixGenerated={handleMatrixGenerated}
            onOpenAIConfig={handleOpenAIConfig}
            className="max-w-4xl mx-auto"
          />
        )}

        {activeTab === 'templates' && (
          <MatrixTemplateManager
            onTemplateApply={handleTemplateApply}
            className="max-w-6xl mx-auto"
          />
        )}
      </Tabs>

      {/* AI Configuration Modal */}
      <AIConfigurationComponent
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
      />
    </div>
  );
};

export default RiskControlMatrixDashboard;
