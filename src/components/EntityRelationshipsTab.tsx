import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Link as LinkIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  GitBranch,
  RefreshCw,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { relationshipService, EntityRelationship } from '../services/relationshipService';

interface EntityRelationshipsTabProps {
  entityType: string;
  entityId: string;
  entityTitle: string;
}

const EntityRelationshipsTab: React.FC<EntityRelationshipsTabProps> = ({
  entityType,
  entityId,
  entityTitle
}) => {
  const [relationships, setRelationships] = useState<EntityRelationship[]>([]);
  const [suggestions, setSuggestions] = useState<EntityRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRelationships();
  }, [entityType, entityId]);

  const loadRelationships = async () => {
    try {
      setLoading(true);
      const [relationshipsData, suggestionsData] = await Promise.all([
        relationshipService.getRelationshipsForEntity(entityType, entityId),
        relationshipService.suggestRelationships(entityType, entityId)
      ]);
      
      setRelationships(relationshipsData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelationship = async (suggestion: EntityRelationship) => {
    try {
      const newRelationship = await relationshipService.createRelationship({
        sourceEntity: suggestion.sourceEntity,
        sourceId: suggestion.sourceId,
        targetEntity: suggestion.targetEntity,
        targetId: suggestion.targetId,
        relationshipType: suggestion.relationshipType,
        strength: suggestion.strength,
        description: suggestion.description
      });

      setRelationships(prev => [newRelationship, ...prev]);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      await relationshipService.deleteRelationship(relationshipId);
      setRelationships(prev => prev.filter(r => r.id !== relationshipId));
    } catch (error) {
      console.error('Error deleting relationship:', error);
    }
  };

  const getEntityLink = (type: string, id: string) => {
    switch (type) {
      case 'audit': return `/audits/${id}`;
      case 'risk': return `/risks/${id}`;
      case 'control': return `/controls/${id}`;
      case 'finding': return `/findings/${id}`;
      case 'compliance': return `/compliance`;
      case 'document': return `/documents/${id}`;
      default: return '#';
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'audit': return '#3b82f6';
      case 'risk': return '#ef4444';
      case 'control': return '#10b981';
      case 'finding': return '#f59e0b';
      case 'compliance': return '#8b5cf6';
      case 'document': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredRelationships = relationships.filter(rel => {
    const matchesType = filterType === 'all' || rel.relationshipType === filterType;
    const matchesSearch = rel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Relationships
          </h3>
          <p className="text-sm text-gray-600">
            Manage connections between {entityTitle} and other entities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadRelationships}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Suggestions</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Relationships</option>
              <option value="audit-risk">Audit → Risk</option>
              <option value="risk-control">Risk → Control</option>
              <option value="audit-finding">Audit → Finding</option>
              <option value="control-compliance">Control → Compliance</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="text-sm font-medium text-blue-900 mb-3">Suggested Relationships</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEntityColor(suggestion.targetEntity) }}
                  />
                  <span className="text-sm text-gray-700">{suggestion.description}</span>
                </div>
                <button
                  onClick={() => handleCreateRelationship(suggestion)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Relationships List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">
            Current Relationships ({filteredRelationships.length})
          </h4>
        </div>
        
        {filteredRelationships.length === 0 ? (
          <div className="p-8 text-center">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No relationships found</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the suggestions above to create relationships
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRelationships.map((relationship) => (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Source Entity */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getEntityColor(relationship.sourceEntity) }}
                      />
                      <span className="text-sm font-medium capitalize">
                        {relationship.sourceEntity}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-gray-400" />

                    {/* Target Entity */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getEntityColor(relationship.targetEntity) }}
                      />
                      <span className="text-sm font-medium capitalize">
                        {relationship.targetEntity}
                      </span>
                    </div>

                    {/* Relationship Type */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {relationship.relationshipType.replace('-', ' → ')}
                    </span>

                    {/* Strength */}
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${relationship.strength}%`,
                            backgroundColor: relationship.strength > 80 ? '#ef4444' : relationship.strength > 60 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{relationship.strength}%</span>
                    </div>

                    {/* Description */}
                    <span className="text-sm text-gray-600 max-w-xs truncate">
                      {relationship.description}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={getEntityLink(relationship.targetEntity, relationship.targetId)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View target entity"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit relationship"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRelationship(relationship.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete relationship"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <LinkIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Relationships</p>
              <p className="text-2xl font-bold text-gray-900">{relationships.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <GitBranch className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Strong Connections</p>
              <p className="text-2xl font-bold text-gray-900">
                {relationships.filter(r => r.strength > 80).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Strength</p>
              <p className="text-2xl font-bold text-gray-900">
                {relationships.length > 0 
                  ? Math.round(relationships.reduce((sum, r) => sum + r.strength, 0) / relationships.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityRelationshipsTab;
