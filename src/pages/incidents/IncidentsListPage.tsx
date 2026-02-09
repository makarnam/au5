import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
  Shield,
  MapPin,
  Server,
  Database,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Incident, IncidentAction } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const IncidentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const data = await resilienceService.getIncidents();
        setIncidents(data);
      } catch (err) {
        setError('Failed to load incidents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Calculate action progress for an incident
  const calculateActionProgress = (incident: Incident) => {
    const allActions = [
      ...(incident.containment_actions || []),
      ...(incident.resolution_actions || []),
    ];

    if (allActions.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const completed = allActions.filter(
      (action) => action.status === 'completed'
    ).length;

    return {
      total: allActions.length,
      completed,
      percentage: Math.round((completed / allActions.length) * 100),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'contained':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="h-4 w-4" />;
      case 'investigating':
        return <Search className="h-4 w-4" />;
      case 'contained':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cyber':
        return <Shield className="h-5 w-5" />;
      case 'physical':
        return <MapPin className="h-5 w-5" />;
      case 'natural_disaster':
        return <AlertCircle className="h-5 w-5" />;
      case 'supply_chain':
        return <Database className="h-5 w-5" />;
      case 'operational':
        return <Server className="h-5 w-5" />;
      case 'regulatory':
        return <Zap className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesQuery =
      !query ||
      incident.title.toLowerCase().includes(query.toLowerCase()) ||
      incident.description.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesType = typeFilter === 'all' || incident.incident_type === typeFilter;

    return matchesQuery && matchesStatus && matchesSeverity && matchesType;
  });

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            İş kesintilerini ve olayları takip edin ve yönetin
          </p>
        </div>
        <button
          onClick={() => navigate('/incidents/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Incident
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Toplam Incident</p>
              <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Açık Incidentler</p>
              <p className="text-2xl font-bold text-red-600">
                {incidents.filter((i) => i.status === 'open').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kritik Seviye</p>
              <p className="text-2xl font-bold text-orange-600">
                {incidents.filter((i) => i.severity === 'critical').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Çözülen</p>
              <p className="text-2xl font-bold text-green-600">
                {incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Incident ara..."
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="open">Açık</option>
              <option value="investigating">İnceleniyor</option>
              <option value="contained">Kontrol Altında</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapandı</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Aciliyetler</option>
              <option value="critical">Kritik</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Tipler</option>
              <option value="cyber">Siber</option>
              <option value="physical">Fiziksel</option>
              <option value="natural_disaster">Doğal Afet</option>
              <option value="supply_chain">Tedarik Zinciri</option>
              <option value="operational">Operasyonel</option>
              <option value="regulatory">Regülasyon</option>
              <option value="other">Diğer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Incidentler ({filteredIncidents.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredIncidents.map((incident) => {
            const progress = calculateActionProgress(incident);
            return (
              <div
                key={incident.id}
                className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getSeverityBorderColor(
                  incident.severity
                )}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section - Incident Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(incident.incident_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {incident.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                              incident.status
                            )}`}
                          >
                            {getStatusIcon(incident.status)}
                            <span className="ml-1 capitalize">{incident.status}</span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(
                              incident.severity
                            )}`}
                          >
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {incident.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Oluşturulma: {formatDate(incident.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Güncelleme: {formatDate(incident.updated_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span className="capitalize">
                              {incident.incident_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Progress & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4 lg:gap-6">
                    {/* Progress Section */}
                    <div className="w-full sm:w-48">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Action İlerlemesi
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(
                            progress.percentage
                          )}`}
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {progress.total} action
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          %{progress.percentage}
                        </span>
                      </div>
                    </div>

                    {/* Detail Button */}
                    <button
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Detayları Gör
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Incident bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Seçili filtrelere uygun incident bulunmuyor.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/incidents/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Incident Oluştur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsListPage;
