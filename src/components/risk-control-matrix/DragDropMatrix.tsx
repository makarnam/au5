import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RiskControlMatrix, MatrixCell, RiskControlMapping, DragDropMatrixProps } from '../../types/riskControlMatrix';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { AlertTriangle, Shield, Move, Plus, CheckCircle, XCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DragDropMatrix: React.FC<DragDropMatrixProps> = ({
  matrix,
  risks,
  controls,
  mappings,
  onMappingChange,
  onRiskDrop,
  onControlDrop
}) => {
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: 'risk' | 'control', item: any } | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [cellMappings, setCellMappings] = useState<Record<string, RiskControlMapping[]>>({});
  const [isDragging, setIsDragging] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize matrix cells based on matrix type
    initializeCells();
  }, [matrix]);

  useEffect(() => {
    // Update cell mappings when mappings prop changes
    updateCellMappings();
  }, [mappings, cells]);

  const initializeCells = () => {
    const size = parseInt(matrix.matrix_type.split('x')[0]);
    const newCells: MatrixCell[] = [];

    for (let y = 1; y <= size; y++) {
      for (let x = 1; x <= size; x++) {
        const riskLevel = getRiskLevelFromPosition(y, size);
        const controlEffectiveness = getControlEffectivenessFromPosition(x, size);
        
        newCells.push({
          id: `${x}-${y}`,
          matrix_id: matrix.id,
          risk_level: riskLevel,
          control_effectiveness: controlEffectiveness,
          position_x: x,
          position_y: y,
          color_code: getCellColor(riskLevel, controlEffectiveness),
          description: `${riskLevel} risk with ${controlEffectiveness} controls`,
          action_required: getActionRequired(riskLevel, controlEffectiveness),
          created_at: new Date().toISOString()
        });
      }
    }

    setCells(newCells);
  };

  const updateCellMappings = () => {
    const newCellMappings: Record<string, RiskControlMapping[]> = {};
    
    cells.forEach(cell => {
      newCellMappings[cell.id] = mappings.filter(mapping => {
        // Check if the mapping's risk and control levels match the cell
        const risk = risks.find(r => r.id === mapping.risk_id);
        const control = controls.find(c => c.id === mapping.control_id);
        
        if (!risk || !control) return false;
        
        return risk.risk_level === cell.risk_level && 
               control.effectiveness === cell.control_effectiveness;
      });
    });
    
    setCellMappings(newCellMappings);
  };

  const getRiskLevelFromPosition = (y: number, size: number): string => {
    const levels = ['low', 'medium', 'high', 'critical'];
    const index = Math.floor((y - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  };

  const getControlEffectivenessFromPosition = (x: number, size: number): string => {
    const levels = ['excellent', 'good', 'adequate', 'weak', 'inadequate'];
    const index = Math.floor((x - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  };

  const getCellColor = (riskLevel: string, controlEffectiveness: string): string => {
    const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7c2d12' };
    const controlColors = { excellent: '#10b981', good: '#3b82f6', adequate: '#f59e0b', weak: '#ef4444', inadequate: '#7c2d12' };
    
    // Blend colors based on risk and control levels
    const riskColor = riskColors[riskLevel as keyof typeof riskColors] || '#6b7280';
    const controlColor = controlColors[controlEffectiveness as keyof typeof controlColors] || '#6b7280';
    
    return riskColor; // For now, just use risk color
  };

  const getActionRequired = (riskLevel: string, controlEffectiveness: string): string => {
    if (riskLevel === 'critical' && controlEffectiveness === 'inadequate') {
      return 'Immediate action required';
    } else if (riskLevel === 'high' && ['weak', 'inadequate'].includes(controlEffectiveness)) {
      return 'High priority action needed';
    } else if (riskLevel === 'medium' && controlEffectiveness === 'adequate') {
      return 'Monitor and improve';
    } else {
      return 'Acceptable risk level';
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'risk' | 'control', item: any) => {
    setDraggedItem({ type, item });
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, item }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedItem(null);
    setHoveredCell(null);
    
    // Remove visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    setHoveredCell(cellId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHoveredCell(null);
  };

  const handleDrop = (e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    try {
      if (draggedItem.type === 'risk') {
        onRiskDrop(draggedItem.item.id, cellId);
        toast.success(`Risk "${draggedItem.item.title}" mapped to cell`);
      } else if (draggedItem.type === 'control') {
        onControlDrop(draggedItem.item.id, cellId);
        toast.success(`Control "${draggedItem.item.title}" mapped to cell`);
      }

      setDraggedItem(null);
      setSelectedCell(cellId);
      setHoveredCell(null);
    } catch (error) {
      toast.error('Failed to map item to cell');
      console.error('Drop error:', error);
    }
  };

  // Keyboard Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return;

    const [x, y] = selectedCell.split('-').map(Number);
    const size = parseInt(matrix.matrix_type.split('x')[0]);
    let newCell: string | null = null;

    switch (e.key) {
      case 'ArrowUp':
        if (y > 1) newCell = `${x}-${y - 1}`;
        break;
      case 'ArrowDown':
        if (y < size) newCell = `${x}-${y + 1}`;
        break;
      case 'ArrowLeft':
        if (x > 1) newCell = `${x - 1}-${y}`;
        break;
      case 'ArrowRight':
        if (x < size) newCell = `${x + 1}-${y}`;
        break;
      case 'Enter':
      case ' ':
        // Toggle cell selection details
        e.preventDefault();
        break;
    }

    if (newCell) {
      setSelectedCell(newCell);
      e.preventDefault();
    }
  }, [selectedCell, matrix.matrix_type]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getCellMappings = (cellId: string) => {
    return cellMappings[cellId] || [];
  };

  const getMappingCount = (cellId: string) => {
    return getCellMappings(cellId).length;
  };

  const size = parseInt(matrix.matrix_type.split('x')[0]);

  return (
    <div className="space-y-6" ref={matrixRef}>
      {/* Matrix Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Risk Control Matrix - {matrix.matrix_type}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{risks.length} Risks</Badge>
              <Badge variant="outline">{controls.length} Controls</Badge>
              <Badge variant="outline">{mappings.length} Mappings</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2" style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`
          }}>
            {cells.map((cell) => {
              const cellMappings = getCellMappings(cell.id);
              const mappingCount = cellMappings.length;
              const isHovered = hoveredCell === cell.id;
              const isSelected = selectedCell === cell.id;
              
              return (
                <TooltipProvider key={cell.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          relative min-h-[120px] p-3 border-2 rounded-lg cursor-pointer
                          transition-all duration-200 hover:shadow-md
                          ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'}
                          ${isHovered && isDragging ? 'border-dashed border-blue-400 bg-blue-50' : ''}
                        `}
                        style={{ backgroundColor: cell.color_code + '20' }}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, cell.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, cell.id)}
                        onClick={() => setSelectedCell(cell.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Matrix cell ${cell.risk_level} risk, ${cell.control_effectiveness} controls`}
                      >
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          {cell.risk_level} / {cell.control_effectiveness}
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          {cell.description}
                        </div>
                        
                        <div className="text-xs font-medium text-gray-800">
                          {cell.action_required}
                        </div>

                        {/* Mapping count indicator */}
                        {mappingCount > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {mappingCount} {mappingCount === 1 ? 'mapping' : 'mappings'}
                            </Badge>
                          </div>
                        )}

                        {/* Drop indicator */}
                        {isHovered && isDragging && (
                          <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-blue-600 text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Drop {draggedItem?.type} here
                            </div>
                          </div>
                        )}

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-1 left-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <div className="font-medium">{cell.risk_level} Risk Level</div>
                        <div className="text-sm text-gray-600">{cell.description}</div>
                        <div className="text-sm font-medium mt-1">{cell.action_required}</div>
                        {mappingCount > 0 && (
                          <div className="text-sm text-blue-600 mt-1">
                            {mappingCount} risk-control mapping{mappingCount !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Draggable Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Risks ({risks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {risks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'risk', risk)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{risk.title}</div>
                      <div className="text-xs text-gray-600">{risk.risk_level}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {risk.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Controls ({controls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {controls.map((control) => (
                <div
                  key={control.id}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'control', control)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{control.title}</div>
                      <div className="text-xs text-gray-600">{control.control_type}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {control.effectiveness}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Cell Details</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Use arrow keys to navigate</span>
                <div className="flex gap-1">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" />
                  <ArrowLeft className="w-3 h-3" />
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cell Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Position:</span> {selectedCell}</div>
                  <div><span className="font-medium">Risk Level:</span> {cells.find(c => c.id === selectedCell)?.risk_level}</div>
                  <div><span className="font-medium">Control Effectiveness:</span> {cells.find(c => c.id === selectedCell)?.control_effectiveness}</div>
                  <div><span className="font-medium">Action Required:</span> {cells.find(c => c.id === selectedCell)?.action_required}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mappings ({getCellMappings(selectedCell).length})</h4>
                <div className="space-y-2">
                  {getCellMappings(selectedCell).slice(0, 3).map((mapping) => {
                    const risk = risks.find(r => r.id === mapping.risk_id);
                    const control = controls.find(c => c.id === mapping.control_id);
                    
                    return (
                      <div key={mapping.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">
                          {risk?.title} → {control?.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          Effectiveness: {mapping.effectiveness_rating}/5 | Coverage: {mapping.coverage_rating}/5
                        </div>
                        {mapping.notes && (
                          <div className="text-xs text-gray-500 mt-1">{mapping.notes}</div>
                        )}
                      </div>
                    );
                  })}
                  {getCellMappings(selectedCell).length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{getCellMappings(selectedCell).length - 3} more mappings
                    </div>
                  )}
                  {getCellMappings(selectedCell).length === 0 && (
                    <div className="text-xs text-gray-500 italic">
                      No mappings in this cell
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DragDropMatrix;
