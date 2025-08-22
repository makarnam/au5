import { supabase } from "../lib/supabase";

export interface EntityRelationship {
  id: string;
  sourceEntity: string;
  sourceId: string;
  targetEntity: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RelationshipQuery {
  sourceEntity?: string;
  targetEntity?: string;
  relationshipType?: string;
  minStrength?: number;
  maxStrength?: number;
}

export interface RelationshipStats {
  totalRelationships: number;
  relationshipsByType: Record<string, number>;
  averageStrength: number;
  strongRelationships: number;
  weakRelationships: number;
}

class RelationshipService {
  async createRelationship(relationship: Omit<EntityRelationship, 'id' | 'created_at' | 'updated_at'>): Promise<EntityRelationship> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('entity_relationships')
        .insert([{
          ...relationship,
          created_by: user.id,
          updated_by: user.id
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  }

  async getRelationships(query?: RelationshipQuery): Promise<EntityRelationship[]> {
    try {
      let supabaseQuery = supabase
        .from('entity_relationships')
        .select('*')
        .order('created_at', { ascending: false });

      if (query?.sourceEntity) {
        supabaseQuery = supabaseQuery.eq('source_entity', query.sourceEntity);
      }

      if (query?.targetEntity) {
        supabaseQuery = supabaseQuery.eq('target_entity', query.targetEntity);
      }

      if (query?.relationshipType) {
        supabaseQuery = supabaseQuery.eq('relationship_type', query.relationshipType);
      }

      if (query?.minStrength) {
        supabaseQuery = supabaseQuery.gte('strength', query.minStrength);
      }

      if (query?.maxStrength) {
        supabaseQuery = supabaseQuery.lte('strength', query.maxStrength);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching relationships:', error);
      throw error;
    }
  }

  async getRelationshipsForEntity(entityType: string, entityId: string): Promise<EntityRelationship[]> {
    try {
      const { data, error } = await supabase
        .from('entity_relationships')
        .select('*')
        .or(`source_entity.eq.${entityType},target_entity.eq.${entityType}`)
        .or(`source_id.eq.${entityId},target_id.eq.${entityId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entity relationships:', error);
      throw error;
    }
  }

  async updateRelationship(id: string, updates: Partial<EntityRelationship>): Promise<EntityRelationship> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('entity_relationships')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating relationship:', error);
      throw error;
    }
  }

  async deleteRelationship(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('entity_relationships')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  }

  async getRelationshipStats(): Promise<RelationshipStats> {
    try {
      const { data: relationships } = await supabase
        .from('entity_relationships')
        .select('relationship_type, strength');

      if (!relationships) {
        return {
          totalRelationships: 0,
          relationshipsByType: {},
          averageStrength: 0,
          strongRelationships: 0,
          weakRelationships: 0
        };
      }

      const relationshipsByType = relationships.reduce((acc, rel) => {
        acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0);
      const averageStrength = relationships.length > 0 ? totalStrength / relationships.length : 0;
      const strongRelationships = relationships.filter(rel => rel.strength > 80).length;
      const weakRelationships = relationships.filter(rel => rel.strength < 40).length;

      return {
        totalRelationships: relationships.length,
        relationshipsByType,
        averageStrength: Math.round(averageStrength),
        strongRelationships,
        weakRelationships
      };
    } catch (error) {
      console.error('Error fetching relationship stats:', error);
      throw error;
    }
  }

  async getCrossModuleRelationships(): Promise<{
    auditRisk: EntityRelationship[];
    riskControl: EntityRelationship[];
    controlCompliance: EntityRelationship[];
    auditFinding: EntityRelationship[];
  }> {
    try {
      const [auditRisk, riskControl, controlCompliance, auditFinding] = await Promise.all([
        this.getRelationships({ relationshipType: 'audit-risk' }),
        this.getRelationships({ relationshipType: 'risk-control' }),
        this.getRelationships({ relationshipType: 'control-compliance' }),
        this.getRelationships({ relationshipType: 'audit-finding' })
      ]);

      return {
        auditRisk,
        riskControl,
        controlCompliance,
        auditFinding
      };
    } catch (error) {
      console.error('Error fetching cross-module relationships:', error);
      throw error;
    }
  }

  async createAuditRiskRelationship(auditId: string, riskId: string, strength: number = 75): Promise<EntityRelationship> {
    return this.createRelationship({
      sourceEntity: 'audit',
      sourceId: auditId,
      targetEntity: 'risk',
      targetId: riskId,
      relationshipType: 'audit-risk',
      strength,
      description: `Audit ${auditId} identifies risk ${riskId}`
    });
  }

  async createRiskControlRelationship(riskId: string, controlId: string, strength: number = 80): Promise<EntityRelationship> {
    return this.createRelationship({
      sourceEntity: 'risk',
      sourceId: riskId,
      targetEntity: 'control',
      targetId: controlId,
      relationshipType: 'risk-control',
      strength,
      description: `Risk ${riskId} is mitigated by control ${controlId}`
    });
  }

  async createControlComplianceRelationship(controlId: string, requirementId: string, strength: number = 85): Promise<EntityRelationship> {
    return this.createRelationship({
      sourceEntity: 'control',
      sourceId: controlId,
      targetEntity: 'compliance',
      targetId: requirementId,
      relationshipType: 'control-compliance',
      strength,
      description: `Control ${controlId} satisfies compliance requirement ${requirementId}`
    });
  }

  async createAuditFindingRelationship(auditId: string, findingId: string, strength: number = 90): Promise<EntityRelationship> {
    return this.createRelationship({
      sourceEntity: 'audit',
      sourceId: auditId,
      targetEntity: 'finding',
      targetId: findingId,
      relationshipType: 'audit-finding',
      strength,
      description: `Audit ${auditId} resulted in finding ${findingId}`
    });
  }

  async getRelatedEntities(entityType: string, entityId: string): Promise<{
    incoming: EntityRelationship[];
    outgoing: EntityRelationship[];
  }> {
    try {
      const [incoming, outgoing] = await Promise.all([
        supabase
          .from('entity_relationships')
          .select('*')
          .eq('target_entity', entityType)
          .eq('target_id', entityId),
        supabase
          .from('entity_relationships')
          .select('*')
          .eq('source_entity', entityType)
          .eq('source_id', entityId)
      ]);

      return {
        incoming: incoming.data || [],
        outgoing: outgoing.data || []
      };
    } catch (error) {
      console.error('Error fetching related entities:', error);
      throw error;
    }
  }

  async suggestRelationships(entityType: string, entityId: string): Promise<EntityRelationship[]> {
    try {
      // This is a simplified suggestion algorithm
      // In a real implementation, this would use AI/ML to suggest relationships
      
      const suggestions: EntityRelationship[] = [];

      if (entityType === 'audit') {
        // Suggest risks that might be related to this audit
        const { data: risks } = await supabase
          .from('risks')
          .select('id, title, category')
          .limit(5);

        risks?.forEach(risk => {
          suggestions.push({
            id: `suggestion-${Date.now()}-${Math.random()}`,
            sourceEntity: 'audit',
            sourceId: entityId,
            targetEntity: 'risk',
            targetId: risk.id,
            relationshipType: 'audit-risk',
            strength: Math.floor(Math.random() * 30) + 70,
            description: `Potential relationship: Audit → Risk "${risk.title}"`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      if (entityType === 'risk') {
        // Suggest controls that might mitigate this risk
        const { data: controls } = await supabase
          .from('controls')
          .select('id, title, control_type')
          .limit(5);

        controls?.forEach(control => {
          suggestions.push({
            id: `suggestion-${Date.now()}-${Math.random()}`,
            sourceEntity: 'risk',
            sourceId: entityId,
            targetEntity: 'control',
            targetId: control.id,
            relationshipType: 'risk-control',
            strength: Math.floor(Math.random() * 30) + 70,
            description: `Potential relationship: Risk → Control "${control.title}"`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating relationship suggestions:', error);
      throw error;
    }
  }

  async bulkCreateRelationships(relationships: Omit<EntityRelationship, 'id' | 'created_at' | 'updated_at'>[]): Promise<EntityRelationship[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const relationshipsWithMetadata = relationships.map(rel => ({
        ...rel,
        created_by: user.id,
        updated_by: user.id
      }));

      const { data, error } = await supabase
        .from('entity_relationships')
        .insert(relationshipsWithMetadata)
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk creating relationships:', error);
      throw error;
    }
  }

  async exportRelationships(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const relationships = await this.getRelationships();

      if (format === 'json') {
        return JSON.stringify(relationships, null, 2);
      }

      if (format === 'csv') {
        const headers = ['id', 'sourceEntity', 'sourceId', 'targetEntity', 'targetId', 'relationshipType', 'strength', 'description', 'created_at'];
        const csvContent = [
          headers.join(','),
          ...relationships.map(rel => [
            rel.id,
            rel.sourceEntity,
            rel.sourceId,
            rel.targetEntity,
            rel.targetId,
            rel.relationshipType,
            rel.strength,
            `"${rel.description}"`,
            rel.created_at
          ].join(','))
        ].join('\n');

        return csvContent;
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting relationships:', error);
      throw error;
    }
  }
}

export const relationshipService = new RelationshipService();
