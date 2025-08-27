import { supabase } from '../lib/supabase';
import {
  RiskControlMatrix,
  MatrixCell,
  RiskControlMapping,
  MatrixTemplate,
  CreateMatrixData,
  UpdateMatrixData,
  CreateMappingData,
  UpdateMappingData,
  UpdateCellData,
  MatrixFilter,
  TemplateFilter,
  CreateTemplateData,
  AIMatrixConfig,
  GapAnalysis,
  ControlSuggestion,
  MatrixAnalytics,
  ExportFormat
} from '../types/riskControlMatrix';
import aiService from './aiService';

class RiskControlMatrixService {
  // Matrix CRUD Operations
  async createMatrix(data: CreateMatrixData): Promise<RiskControlMatrix> {
    console.log('Starting matrix creation...');
    
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('Auth check result:', { user: user?.user?.id, error: authError });
    
    if (!user.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Validate the data before inserting
    if (!data.name || !data.description || !data.matrix_type) {
      throw new Error('Missing required fields: name, description, or matrix_type');
    }

    if (!Array.isArray(data.risk_levels) || data.risk_levels.length === 0) {
      throw new Error('risk_levels must be a non-empty array');
    }

    if (!Array.isArray(data.control_effectiveness_levels) || data.control_effectiveness_levels.length === 0) {
      throw new Error('control_effectiveness_levels must be a non-empty array');
    }

    // Validate business_unit_id if provided
    if (data.business_unit_id && data.business_unit_id !== '') {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.business_unit_id)) {
        console.error('Invalid business_unit_id format:', data.business_unit_id);
        throw new Error('Invalid business_unit_id format');
      }
    }

    // Validate framework_id if provided
    if (data.framework_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.framework_id)) {
        console.error('Invalid framework_id format:', data.framework_id);
        throw new Error('Invalid framework_id format');
      }
    }

    console.log('Creating matrix with data:', data);

    const { data: matrix, error } = await supabase
      .from('risk_control_matrices')
      .insert({
        ...data,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating matrix:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        data: data
      });
      throw new Error(`Failed to create matrix: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
    }
    
    return matrix;
  }

  async updateMatrix(id: string, data: UpdateMatrixData): Promise<RiskControlMatrix> {
    const { data: matrix, error } = await supabase
      .from('risk_control_matrices')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return matrix;
  }

  async deleteMatrix(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_control_matrices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getMatrix(id: string): Promise<RiskControlMatrix> {
    const { data: matrix, error } = await supabase
      .from('risk_control_matrices')
      .select(`
        *,
        business_units(name),
        compliance_frameworks(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return matrix;
  }

  async getMatrices(filter: MatrixFilter = {}): Promise<RiskControlMatrix[]> {
    let query = supabase
      .from('risk_control_matrices')
      .select(`
        *,
        business_units(name),
        compliance_frameworks(name)
      `);

    if (filter.business_unit_id) {
      query = query.eq('business_unit_id', filter.business_unit_id);
    }
    if (filter.framework_id) {
      query = query.eq('framework_id', filter.framework_id);
    }
    if (filter.matrix_type) {
      query = query.eq('matrix_type', filter.matrix_type);
    }
    if (filter.created_by) {
      query = query.eq('created_by', filter.created_by);
    }

    const { data: matrices, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return matrices || [];
  }

  // Cell Management
  async updateCell(id: string, data: UpdateCellData): Promise<MatrixCell> {
    const { data: cell, error } = await supabase
      .from('matrix_cells')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return cell;
  }

  async getMatrixCells(matrixId: string): Promise<MatrixCell[]> {
    const { data: cells, error } = await supabase
      .from('matrix_cells')
      .select('*')
      .eq('matrix_id', matrixId)
      .order('position_y', { ascending: true })
      .order('position_x', { ascending: true });

    if (error) throw error;
    return cells || [];
  }

  // Mapping Management
  async createMapping(data: CreateMappingData): Promise<RiskControlMapping> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: mapping, error } = await supabase
      .from('risk_control_mappings')
      .insert({
        ...data,
        mapped_by: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return mapping;
  }

  async updateMapping(id: string, data: UpdateMappingData): Promise<RiskControlMapping> {
    const { data: mapping, error } = await supabase
      .from('risk_control_mappings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapping;
  }

  async deleteMapping(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_control_mappings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getMappings(matrixId: string): Promise<RiskControlMapping[]> {
    const { data: mappings, error } = await supabase
      .from('risk_control_mappings')
      .select(`
        *,
        risks(title, risk_level),
        controls(title, control_type)
      `)
      .eq('matrix_id', matrixId);

    if (error) throw error;
    return mappings || [];
  }

  // AI Integration
  async generateMatrixWithAI(config: AIMatrixConfig): Promise<RiskControlMatrix> {
    const prompt = `
      Create a risk-control matrix for ${config.industry} industry with the following specifications:
      - Matrix size: ${config.matrix_size}
      - Risk categories: ${config.risk_categories.join(', ')}
      - Control frameworks: ${config.control_frameworks.join(', ')}
      - Business size: ${config.business_size}
      - Generation focus: ${config.generation_focus}
      
      Generate:
      1. Risk levels and descriptions
      2. Control effectiveness levels
      3. Matrix cell descriptions and action requirements
      4. Color coding scheme
      5. Risk-control mapping recommendations
      
      Return the response as a JSON object with the following structure:
      {
        "name": "Matrix Name",
        "description": "Matrix Description",
        "matrix_type": "${config.matrix_size}",
        "risk_levels": ["low", "medium", "high", "critical"],
        "control_effectiveness_levels": ["excellent", "good", "adequate", "weak", "inadequate"],
        "cells": [
          {
            "position_x": 1,
            "position_y": 1,
            "color_code": "#00ff00",
            "description": "Cell description",
            "action_required": "Action required"
          }
        ]
      }
    `;

    const response = await aiService.generateContent(prompt);
    const matrixData = JSON.parse(response);

    // Create the matrix
    const matrix = await this.createMatrix({
      name: matrixData.name,
      description: matrixData.description,
      matrix_type: matrixData.matrix_type as any,
      risk_levels: matrixData.risk_levels,
      control_effectiveness_levels: matrixData.control_effectiveness_levels,
      business_unit_id: '', // Will be set by the user
      framework_id: undefined
    });

    // Create cells
    for (const cellData of matrixData.cells) {
      await supabase
        .from('matrix_cells')
        .insert({
          matrix_id: matrix.id,
          risk_level: this.getRiskLevelFromPosition(cellData.position_y, config.matrix_size),
          control_effectiveness: this.getControlEffectivenessFromPosition(cellData.position_x, config.matrix_size),
          position_x: cellData.position_x,
          position_y: cellData.position_y,
          color_code: cellData.color_code,
          description: cellData.description,
          action_required: cellData.action_required
        });
    }

    return matrix;
  }

  async analyzeGaps(matrixId: string): Promise<GapAnalysis> {
    const prompt = `
      Analyze the current risk-control matrix and identify:
      1. Uncovered risks
      2. Weak control areas
      3. Over-controlled areas
      4. Optimization opportunities
      5. Recommended actions
      
      Return the analysis as a JSON object with the following structure:
      {
        "uncovered_risks": ["Risk 1", "Risk 2"],
        "weak_control_areas": ["Area 1", "Area 2"],
        "over_controlled_areas": ["Area 1", "Area 2"],
        "optimization_opportunities": ["Opportunity 1", "Opportunity 2"],
        "recommended_actions": ["Action 1", "Action 2"]
      }
    `;

    const response = await aiService.generateContent(prompt);
    return JSON.parse(response);
  }

  async suggestMappings(riskId: string, matrixId: string): Promise<ControlSuggestion[]> {
    const prompt = `
      Based on the risk with ID ${riskId} in matrix ${matrixId},
      suggest appropriate controls from the available control set.
      Consider:
      - Control effectiveness
      - Coverage adequacy
      - Cost-benefit analysis
      - Implementation complexity
      
      Return the suggestions as a JSON array with the following structure:
      [
        {
          "control_id": "control-uuid",
          "control_title": "Control Title",
          "effectiveness_score": 4,
          "coverage_score": 3,
          "reasoning": "Reason for suggestion"
        }
      ]
    `;

    const response = await aiService.generateContent(prompt);
    return JSON.parse(response);
  }

  // Templates
  async getTemplates(filter: TemplateFilter = {}): Promise<MatrixTemplate[]> {
    let query = supabase
      .from('matrix_templates')
      .select('*');

    if (filter.industry) {
      query = query.eq('industry', filter.industry);
    }
    if (filter.framework) {
      query = query.eq('framework', filter.framework);
    }
    if (filter.is_public !== undefined) {
      query = query.eq('is_public', filter.is_public);
    }
    if (filter.matrix_type) {
      query = query.eq('matrix_type', filter.matrix_type);
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return templates || [];
  }

  async createTemplate(data: CreateTemplateData): Promise<MatrixTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: template, error } = await supabase
      .from('matrix_templates')
      .insert({
        ...data,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return template;
  }

  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<MatrixTemplate> {
    const { data: template, error } = await supabase
      .from('matrix_templates')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('matrix_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTemplate(id: string): Promise<MatrixTemplate> {
    const { data: template, error } = await supabase
      .from('matrix_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return template;
  }

  async applyTemplate(templateId: string, matrixId: string): Promise<void> {
    const { data: template, error: templateError } = await supabase
      .from('matrix_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Apply template data to matrix
    await this.updateMatrix(matrixId, {
      matrix_type: template.matrix_type,
      risk_levels: template.template_data.risk_levels,
      control_effectiveness_levels: template.template_data.control_effectiveness_levels
    });

    // Apply template cells
    for (const cellData of template.template_data.cells) {
      await supabase
        .from('matrix_cells')
        .upsert({
          matrix_id: matrixId,
          risk_level: cellData.risk_level,
          control_effectiveness: cellData.control_effectiveness,
          position_x: cellData.position_x,
          position_y: cellData.position_y,
          color_code: cellData.color_code,
          description: cellData.description,
          action_required: cellData.action_required
        });
    }
  }

  // Analytics
  async getMatrixAnalytics(matrixId: string): Promise<MatrixAnalytics> {
    const [matrix, mappings, cells] = await Promise.all([
      this.getMatrix(matrixId),
      this.getMappings(matrixId),
      this.getMatrixCells(matrixId)
    ]);

    // Get total risks and controls
    const { data: risks } = await supabase.from('risks').select('id');
    const { data: controls } = await supabase.from('controls').select('id');

    const totalRisks = risks?.length || 0;
    const totalControls = controls?.length || 0;
    const mappedRisks = new Set(mappings.map(m => m.risk_id)).size;
    const mappedControls = new Set(mappings.map(m => m.control_id)).size;

    // Calculate distributions
    const effectivenessDistribution: Record<string, number> = {};
    const riskDistribution: Record<string, number> = {};

    mappings.forEach(mapping => {
      const effectiveness = mapping.effectiveness_rating.toString();
      effectivenessDistribution[effectiveness] = (effectivenessDistribution[effectiveness] || 0) + 1;
    });

    // Get gap analysis
    const gapAnalysis = await this.analyzeGaps(matrixId);

    return {
      total_risks: totalRisks,
      total_controls: totalControls,
      mapped_risks: mappedRisks,
      mapped_controls: mappedControls,
      coverage_percentage: totalRisks > 0 ? (mappedRisks / totalRisks) * 100 : 0,
      effectiveness_distribution: effectivenessDistribution,
      risk_distribution: riskDistribution,
      gap_analysis: gapAnalysis
    };
  }

  async exportMatrix(matrixId: string, format: ExportFormat): Promise<Blob> {
    const [matrix, mappings, cells] = await Promise.all([
      this.getMatrix(matrixId),
      this.getMappings(matrixId),
      this.getMatrixCells(matrixId)
    ]);

    const data = {
      matrix,
      mappings,
      cells,
      export_date: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      case 'csv':
        // Convert to CSV format
        const csvContent = this.convertToCSV(data);
        return new Blob([csvContent], { type: 'text/csv' });
      case 'excel':
        // For Excel, we'll return JSON for now - can be enhanced with a proper Excel library
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      case 'pdf':
        // For PDF, we'll return JSON for now - can be enhanced with a proper PDF library
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Helper methods
  private getRiskLevelFromPosition(y: number, matrixSize: string): string {
    const size = parseInt(matrixSize.split('x')[0]);
    const levels = ['low', 'medium', 'high', 'critical'];
    const index = Math.floor((y - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  }

  private getControlEffectivenessFromPosition(x: number, matrixSize: string): string {
    const size = parseInt(matrixSize.split('x')[1]);
    const levels = ['excellent', 'good', 'adequate', 'weak', 'inadequate'];
    const index = Math.floor((x - 1) * levels.length / size);
    return levels[Math.min(index, levels.length - 1)];
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - can be enhanced
    const headers = ['id', 'name', 'description', 'matrix_type'];
    const rows = [headers.join(',')];
    
    rows.push([
      data.matrix.id,
      data.matrix.name,
      data.matrix.description,
      data.matrix.matrix_type
    ].join(','));

    return rows.join('\n');
  }
}

export default new RiskControlMatrixService();
