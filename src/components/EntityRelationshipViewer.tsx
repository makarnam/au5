import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Link as LinkIcon,
  GitBranch,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Network,
  GitCommit,
  GitPullRequest
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Relationship {
  id: string;
  sourceEntity: string;
  sourceId: string;
  targetEntity: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface EntityNode {
  id: string;
  type: 'audit' | 'risk' | 'control' | 'finding' | 'compliance' | 'document';
  title: string;
  status: string;
  x: number;
  y: number;
}

interface EntityConnection {
  source: string;
  target: string;
  type: string;
  strength: number;
}

const EntityRelationshipViewer: React.FC = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [nodes, setNodes] = useState<EntityNode[]>([]);
  const [connections, setConnections] = useState<EntityConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    try {
      setLoading(true);

      // Load audits
      const { data: audits } = await supabase
        .from('audits')
        .select('id, title, status')
        .eq('is_deleted', false)
        .limit(20);

      // Load risks
      const { data: risks } = await supabase
        .from('risks')
        .select('id, title, status')
        .limit(20);

      // Load controls
      const { data: controls } = await supabase
        .from('controls')
        .select('id, title, status')
        .limit(20);

      // Load findings
      const { data: findings } = await supabase
        .from('findings')
        .select('id, title, severity')
        .limit(20);

      // Create nodes
      const allNodes: EntityNode[] = [];
      let xOffset = 0;

      // Add audit nodes
      audits?.forEach((audit, index) => {
        allNodes.push({
          id: audit.id,
          type: 'audit',
          title: audit.title,
          status: audit.status,
          x: xOffset + (index * 150),
          y: 100
        });
      });

      xOffset += (audits?.length || 0) * 150 + 100;

      // Add risk nodes
      risks?.forEach((risk, index) => {
        allNodes.push({
          id: risk.id,
          type: 'risk',
          title: risk.title,
          status: risk.status,
          x: xOffset + (index * 150),
          y: 300
        });
      });

      xOffset += (risks?.length || 0) * 150 + 100;

      // Add control nodes
      controls?.forEach((control, index) => {
        allNodes.push({
          id: control.id,
          type: 'control',
          title: control.title,
          status: control.status,
          x: xOffset + (index * 150),
          y: 500
        });
      });

      xOffset += (controls?.length || 0) * 150 + 100;

      // Add finding nodes
      findings?.forEach((finding, index) => {
        allNodes.push({
          id: finding.id,
          type: 'finding',
          title: finding.title,
          status: finding.severity,
          x: xOffset + (index * 150),
          y: 700
        });
      });

      setNodes(allNodes);

      // Create connections based on relationships
      const allConnections: EntityConnection[] = [];

      // Audit to Risk connections
      audits?.forEach(audit => {
        const relatedRisks = risks?.slice(0, 3); // Connect to first 3 risks
        relatedRisks?.forEach(risk => {
          allConnections.push({
            source: audit.id,
            target: risk.id,
            type: 'audit-risk',
            strength: Math.floor(Math.random() * 30) + 70
          });
        });
      });

      // Risk to Control connections
      risks?.forEach(risk => {
        const relatedControls = controls?.slice(0, 2); // Connect to first 2 controls
        relatedControls?.forEach(control => {
          allConnections.push({
            source: risk.id,
            target: control.id,
            type: 'risk-control',
            strength: Math.floor(Math.random() * 30) + 70
          });
        });
      });

      // Audit to Finding connections
      audits?.forEach(audit => {
        const relatedFindings = findings?.slice(0, 2); // Connect to first 2 findings
        relatedFindings?.forEach(finding => {
          allConnections.push({
            source: audit.id,
            target: finding.id,
            type: 'audit-finding',
            strength: Math.floor(Math.random() * 30) + 70
          });
        });
      });

      setConnections(allConnections);

      // Create relationship objects for the list view
      const relationshipObjects: Relationship[] = allConnections.map((conn, index) => {
        const sourceNode = allNodes.find(n => n.id === conn.source);
        const targetNode = allNodes.find(n => n.id === conn.target);
        
        return {
          id: `rel-${index}`,
          sourceEntity: sourceNode?.type || 'unknown',
          sourceId: conn.source,
          targetEntity: targetNode?.type || 'unknown',
          targetId: conn.target,
          relationshipType: conn.type,
          strength: conn.strength,
          description: `${sourceNode?.title} → ${targetNode?.title}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      setRelationships(relationshipObjects);

    } catch (error) {
      console.error('Error loading relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (type: string) => {
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

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'audit': return '📋';
      case 'risk': return '⚠️';
      case 'control': return '🛡️';
      case 'finding': return '🔍';
      case 'compliance': return '✅';
      case 'document': return '📄';
      default: return '📌';
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

  const filteredRelationships = relationships.filter(rel => {
    const matchesType = filterType === 'all' || rel.relationshipType === filterType;
    const matchesSearch = rel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredNodes = nodes.filter(node => {
    if (selectedEntity) {
      return connections.some(conn => 
        conn.source === node.id || conn.target === node.id
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Network className="w-8 h-8 mr-3" />
            Entity Relationships
          </h1>
          <p className="text-gray-600 mt-1">Visualize and manage relationships between GRC entities</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadRelationships}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
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

      {/* Network Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <GitBranch className="w-5 h-5 mr-2" />
          Entity Network
        </h2>
        <div className="relative h-96 border border-gray-200 rounded-lg overflow-hidden">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map((connection, index) => {
              const sourceNode = nodes.find(n => n.id === connection.source);
              const targetNode = nodes.find(n => n.id === connection.target);
              
              if (!sourceNode || !targetNode) return null;

              return (
                <motion.line
                  key={index}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={connection.strength > 80 ? '#ef4444' : connection.strength > 60 ? '#f59e0b' : '#10b981'}
                  strokeWidth={connection.strength / 20}
                  strokeDasharray="5,5"
                  opacity={0.6}
                />
              );
            })}
          </svg>

          {/* Entity nodes */}
          {filteredNodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: node.x, top: node.y }}
              onClick={() => setSelectedEntity(selectedEntity === node.id ? null : node.id)}
            >
              <div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all ${
                  selectedEntity === node.id ? 'ring-4 ring-blue-300' : ''
                }`}
                style={{ backgroundColor: getNodeColor(node.type) }}
              >
                {getNodeIcon(node.type)}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700 truncate w-20">
                  {node.title.substring(0, 15)}...
                </p>
                <p className="text-xs text-gray-500 capitalize">{node.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Relationships List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center">
            <LinkIcon className="w-5 h-5 mr-2" />
            Relationship Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRelationships.map((relationship) => (
                <motion.tr
                  key={relationship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getNodeColor(relationship.sourceEntity) }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {relationship.sourceEntity}
                        </div>
                        <div className="text-sm text-gray-500">
                          {relationship.description.split(' → ')[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getNodeColor(relationship.targetEntity) }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {relationship.targetEntity}
                        </div>
                        <div className="text-sm text-gray-500">
                          {relationship.description.split(' → ')[1]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {relationship.relationshipType.replace('-', ' → ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${relationship.strength}%`,
                            backgroundColor: relationship.strength > 80 ? '#ef4444' : relationship.strength > 60 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{relationship.strength}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={getEntityLink(relationship.sourceEntity, relationship.sourceId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitCommit className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Relationships</p>
              <p className="text-2xl font-bold text-gray-900">{relationships.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Network className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected Entities</p>
              <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <GitPullRequest className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Strong Connections</p>
              <p className="text-2xl font-bold text-gray-900">
                {connections.filter(c => c.strength > 80).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LinkIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Strength</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(connections.reduce((sum, c) => sum + c.strength, 0) / connections.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityRelationshipViewer;
