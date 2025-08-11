import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  BarChart3,
  FileText,
  Zap,
  Target,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResilienceProgram, 
  Incident, 
  Crisis, 
  ScenarioAnalysis 
} from '../../types/resilience';
import { 
  resilienceService, 
  filterAndSortPrograms, 
  computeProgramMetrics,
  computeIncidentMetrics,
  computeCrisisMetrics
} from '../../services/resilienceService';

const ResilienceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<ResilienceProgram[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [scenarioAnalyses, setScenarioAnalyses] = useState<ScenarioAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [programQuery, setProgramQuery] = useState('');
  const [programStatus, setProgramStatus] = useState('all');
  const [programMaturity, setProgramMaturity] = useState('all');
  const [programOwner, setProgramOwner] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'maturity' | 'status'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [programsData, incidentsData, crisesData, scenarioData] = await Promise.all([
          resilienceService.getPrograms(),
          resilienceService.getIncidents(),
          resilienceService.getCrises(),
          resilienceService.getScenarioAnalyses()
        ]);
        
        setPrograms(programsData);
        setIncidents(incidentsData);
        setCrises(crisesData);
        setScenarioAnalyses(scenarioData);
      } catch (err) {
        setError('Failed to load resilience data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPrograms = useMemo(
    () => filterAndSortPrograms(programs, { 
      query: programQuery, 
      status: programStatus, 
      maturity_level: programMaturity, 
      owner: programOwner, 
      sortBy, 
      sortDir 
    }),
    [programs, programQuery, programStatus, programMaturity, programOwner, sortBy, sortDir]
  );

  const programMetrics = useMemo(() => computeProgramMetrics(programs), [programs]);
  const incidentMetrics = useMemo(() => computeIncidentMetrics(incidents), [incidents]);
  const crisisMetrics = useMemo(() => computeCrisisMetrics(crises), [crises]);

  const handleCreateProgram = () => {
    navigate('/resilience/programs/create');
  };

  const handleViewProgram = (id: string) => {
    navigate(`/resilience/programs/${id}`);
  };

  const handleCreateIncident = () => {
    navigate('/resilience/incidents/create');
  };

  const handleCreateCrisis = () => {
    navigate('/resilience/crises/create');
  };

  const handleCreateScenario = () => {
    navigate('/resilience/scenarios/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'world_class': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'basic': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resilience Management</h1>
          <p className="text-gray-600 mt-1">
            Organizational resilience and business continuity across all types of disruptions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateProgram}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Program
          </button>
          <button
            onClick={handleCreateIncident}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Programs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Programs</dt>
                  <dd className="text-lg font-medium text-gray-900">{programMetrics.activePrograms}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Total: {programMetrics.totalPrograms}</span>
              <span className="ml-2 text-gray-500">•</span>
              <span className="ml-2 text-gray-500">Avg Maturity: {programMetrics.avgMaturityScore}%</span>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Incidents</dt>
                  <dd className="text-lg font-medium text-gray-900">{incidentMetrics.openIncidents}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Critical: {incidentMetrics.criticalIncidents}</span>
              <span className="ml-2 text-gray-500">•</span>
              <span className="ml-2 text-gray-500">Avg Resolution: {incidentMetrics.avgResolutionTimeHours}h</span>
            </div>
          </div>
        </div>

        {/* Crises */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Crises</dt>
                  <dd className="text-lg font-medium text-gray-900">{crisisMetrics.activeCrises}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Critical: {crisisMetrics.criticalCrises}</span>
              <span className="ml-2 text-gray-500">•</span>
              <span className="ml-2 text-gray-500">Resolved: {crisisMetrics.resolvedCrises}</span>
            </div>
          </div>
        </div>

        {/* Scenario Analyses */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scenario Analyses</dt>
                  <dd className="text-lg font-medium text-gray-900">{scenarioAnalyses.length}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Active: {scenarioAnalyses.filter(s => s.status === 'active').length}</span>
              <span className="ml-2 text-gray-500">•</span>
              <span className="ml-2 text-gray-500">Draft: {scenarioAnalyses.filter(s => s.status === 'draft').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateProgram}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Create Program</div>
                <div className="text-sm text-gray-500">New resilience program</div>
              </div>
            </button>

            <button
              onClick={handleCreateIncident}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Report Incident</div>
                <div className="text-sm text-gray-500">Business disruption</div>
              </div>
            </button>

            <button
              onClick={handleCreateCrisis}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Declare Crisis</div>
                <div className="text-sm text-gray-500">Crisis response</div>
              </div>
            </button>

            <button
              onClick={handleCreateScenario}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Scenario Analysis</div>
                <div className="text-sm text-gray-500">Risk modeling</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Resilience Programs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Resilience Programs</h3>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <input
                  value={programQuery}
                  onChange={(e) => setProgramQuery(e.target.value)}
                  placeholder="Search programs..."
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-9 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <select 
                value={programStatus} 
                onChange={(e) => setProgramStatus(e.target.value)} 
                className="border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="under_review">Under Review</option>
              </select>
              <select 
                value={programMaturity} 
                onChange={(e) => setProgramMaturity(e.target.value)} 
                className="border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                <option value="all">All Maturity</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="world_class">World Class</option>
              </select>
              <input 
                value={programOwner} 
                onChange={(e) => setProgramOwner(e.target.value)} 
                placeholder="Filter by owner" 
                className="border border-gray-300 rounded-md py-2 px-3 text-sm" 
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maturity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrograms.slice(0, 10).map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{program.name}</div>
                      <div className="text-sm text-gray-500">{program.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.status)}`}>
                      {program.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaturityColor(program.maturity_level)}`}>
                      {program.maturity_level.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(program.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewProgram(program.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new resilience program.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateProgram}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Incidents</h3>
              <button
                onClick={() => navigate('/resilience/incidents')}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            {incidents.slice(0, 5).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    incident.severity === 'critical' ? 'bg-red-500' :
                    incident.severity === 'high' ? 'bg-orange-500' :
                    incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                    <div className="text-sm text-gray-500">{incident.incident_type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No recent incidents</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Crises */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Crises</h3>
              <button
                onClick={() => navigate('/resilience/crises')}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            {crises.slice(0, 5).map((crisis) => (
              <div key={crisis.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    crisis.severity === 'critical' ? 'bg-red-500' :
                    crisis.severity === 'high' ? 'bg-orange-500' :
                    crisis.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{crisis.title}</div>
                    <div className="text-sm text-gray-500">{crisis.crisis_type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(crisis.severity)}`}>
                    {crisis.severity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(crisis.declared_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {crises.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No recent crises</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResilienceDashboard;
