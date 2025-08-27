import React, { useState } from 'react';
import DragDropMatrix from './DragDropMatrix';
import { RiskControlMatrix, RiskControlMapping } from '../../types/riskControlMatrix';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';

const DragDropMatrixDemo: React.FC = () => {
  const [mappings, setMappings] = useState<RiskControlMapping[]>([]);

  // Sample matrix data
  const sampleMatrix: RiskControlMatrix = {
    id: 'demo-matrix-1',
    name: 'Demo Risk Control Matrix',
    description: 'A demonstration matrix for testing drag and drop functionality',
    matrix_type: '3x3',
    risk_levels: ['low', 'medium', 'high'],
    control_effectiveness_levels: ['excellent', 'good', 'adequate'],
    business_unit_id: 'demo-unit-1',
    created_by: 'demo-user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Sample risks
  const sampleRisks = [
    {
      id: 'risk-1',
      title: 'Data Breach Risk',
      risk_level: 'high',
      category: 'Cybersecurity',
      description: 'Risk of unauthorized access to sensitive data',
    },
    {
      id: 'risk-2',
      title: 'Operational Disruption',
      risk_level: 'medium',
      category: 'Operations',
      description: 'Risk of system downtime affecting business operations',
    },
    {
      id: 'risk-3',
      title: 'Compliance Violation',
      risk_level: 'high',
      category: 'Regulatory',
      description: 'Risk of failing to meet regulatory requirements',
    },
    {
      id: 'risk-4',
      title: 'Resource Shortage',
      risk_level: 'low',
      category: 'Resource',
      description: 'Risk of insufficient resources for project completion',
    },
  ];

  // Sample controls
  const sampleControls = [
    {
      id: 'control-1',
      title: 'Access Control System',
      control_type: 'Preventive',
      effectiveness: 'good',
      description: 'Multi-factor authentication and role-based access control',
    },
    {
      id: 'control-2',
      title: 'Backup and Recovery',
      control_type: 'Detective',
      effectiveness: 'excellent',
      description: 'Automated backup systems with regular testing',
    },
    {
      id: 'control-3',
      title: 'Compliance Monitoring',
      control_type: 'Preventive',
      effectiveness: 'adequate',
      description: 'Regular compliance audits and monitoring',
    },
    {
      id: 'control-4',
      title: 'Resource Planning',
      control_type: 'Preventive',
      effectiveness: 'good',
      description: 'Comprehensive resource planning and allocation',
    },
  ];

  const handleRiskDrop = (riskId: string, cellId: string) => {
    const risk = sampleRisks.find(r => r.id === riskId);
    const cell = cellId.split('-').map(Number);
    
    // Create a new mapping
    const newMapping: RiskControlMapping = {
      id: `mapping-${Date.now()}`,
      matrix_id: sampleMatrix.id,
      risk_id: riskId,
      control_id: '', // Will be set when control is dropped
      mapping_date: new Date().toISOString(),
      mapped_by: 'demo-user-1',
      effectiveness_rating: 3,
      coverage_rating: 3,
      notes: `Risk "${risk?.title}" mapped to cell ${cellId}`,
      created_at: new Date().toISOString(),
    };

    setMappings(prev => [...prev, newMapping]);
    toast.success(`Risk "${risk?.title}" dropped in cell ${cellId}`);
  };

  const handleControlDrop = (controlId: string, cellId: string) => {
    const control = sampleControls.find(c => c.id === controlId);
    const cell = cellId.split('-').map(Number);
    
    // Find existing mapping for this cell or create new one
    const existingMapping = mappings.find(m => {
      // This is a simplified logic - in real implementation you'd need more sophisticated matching
      return m.risk_id && !m.control_id;
    });

    if (existingMapping) {
      // Update existing mapping
      const updatedMapping = {
        ...existingMapping,
        control_id: controlId,
        notes: `${existingMapping.notes} + Control "${control?.title}"`,
      };
      setMappings(prev => prev.map(m => m.id === existingMapping.id ? updatedMapping : m));
      toast.success(`Control "${control?.title}" paired with risk in cell ${cellId}`);
    } else {
      // Create new mapping
      const newMapping: RiskControlMapping = {
        id: `mapping-${Date.now()}`,
        matrix_id: sampleMatrix.id,
        risk_id: '', // Will be set when risk is dropped
        control_id: controlId,
        mapping_date: new Date().toISOString(),
        mapped_by: 'demo-user-1',
        effectiveness_rating: 3,
        coverage_rating: 3,
        notes: `Control "${control?.title}" mapped to cell ${cellId}`,
        created_at: new Date().toISOString(),
      };
      setMappings(prev => [...prev, newMapping]);
      toast.success(`Control "${control?.title}" dropped in cell ${cellId}`);
    }
  };

  const handleMappingChange = (mapping: RiskControlMapping) => {
    setMappings(prev => prev.map(m => m.id === mapping.id ? mapping : m));
    toast.success('Mapping updated successfully');
  };

  const resetMappings = () => {
    setMappings([]);
    toast.success('All mappings cleared');
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Risk Control Matrix Demo</span>
            <Button onClick={resetMappings} variant="outline" size="sm">
              Reset Mappings
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            <p>This demo showcases the enhanced drag and drop functionality for risk control matrices.</p>
            <p className="mt-2">
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Drag risks and controls to matrix cells</li>
              <li>Visual feedback during drag operations</li>
              <li>Keyboard navigation with arrow keys</li>
              <li>Mapping count indicators</li>
              <li>Detailed cell information display</li>
              <li>Toast notifications for user feedback</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <DragDropMatrix
        matrix={sampleMatrix}
        risks={sampleRisks}
        controls={sampleControls}
        mappings={mappings}
        onMappingChange={handleMappingChange}
        onRiskDrop={handleRiskDrop}
        onControlDrop={handleControlDrop}
      />

      <Card>
        <CardHeader>
          <CardTitle>Demo Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">How to Use:</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                <li>Drag risks from the left panel to matrix cells</li>
                <li>Drag controls from the right panel to matrix cells</li>
                <li>Click on cells to view detailed information</li>
                <li>Use arrow keys to navigate between cells</li>
                <li>Watch for visual feedback during drag operations</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Keyboard Navigation:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↓</kbd> <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd> Navigate between cells</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> Select cell</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Visual Indicators:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Blue border: Selected cell</li>
                <li>Dashed border: Drop target during drag</li>
                <li>Badge with number: Mapping count in cell</li>
                <li>Blue dot: Current selection indicator</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DragDropMatrixDemo;
