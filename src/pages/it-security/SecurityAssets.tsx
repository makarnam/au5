import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Search,
  Plus,
  Filter,
  Server,
  Database,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  HardDrive,
  Globe,
  Users,
  Building,
  Activity
} from 'lucide-react';

interface SecurityAsset {
  id: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'application' | 'endpoint' | 'cloud';
  category: 'critical' | 'high' | 'medium' | 'low';
  status: 'operational' | 'maintenance' | 'degraded' | 'offline';
  location: string;
  owner: string;
  ip_address: string;
  last_scan: string;
  vulnerabilities: number;
  risk_score: number;
  tags: string[];
}

const SecurityAssets: React.FC = () => {
  const [assets, setAssets] = useState<SecurityAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<SecurityAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockAssets: SecurityAsset[] = [
    {
      id: '1',
      name: 'Web Application Server',
      type: 'server',
      category: 'critical',
      status: 'operational',
      location: 'Data Center A',
      owner: 'IT Team',
      ip_address: '192.168.1.100',
      last_scan: '2024-01-20T10:30:00Z',
      vulnerabilities: 2,
      risk_score: 75,
      tags: ['web-app', 'production', 'load-balanced']
    },
    {
      id: '2',
      name: 'Customer Database',
      type: 'database',
      category: 'critical',
      status: 'operational',
      location: 'Data Center A',
      owner: 'Database Team',
      ip_address: '192.168.1.101',
      last_scan: '2024-01-20T09:15:00Z',
      vulnerabilities: 0,
      risk_score: 25,
      tags: ['customer-data', 'encrypted', 'backup-enabled']
    },
    {
      id: '3',
      name: 'Firewall Gateway',
      type: 'network',
      category: 'critical',
      status: 'operational',
      location: 'Network Operations',
      owner: 'Network Team',
      ip_address: '192.168.1.1',
      last_scan: '2024-01-20T11:00:00Z',
      vulnerabilities: 1,
      risk_score: 45,
      tags: ['firewall', 'gateway', 'high-availability']
    },
    {
      id: '4',
      name: 'Email Server',
      type: 'server',
      category: 'high',
      status: 'maintenance',
      location: 'Data Center B',
      owner: 'IT Team',
      ip_address: '192.168.1.102',
      last_scan: '2024-01-19T16:45:00Z',
      vulnerabilities: 3,
      risk_score: 85,
      tags: ['email', 'exchange', 'scheduled-maintenance']
    },
    {
      id: '5',
      name: 'Cloud Storage',
      type: 'cloud',
      category: 'high',
      status: 'operational',
      location: 'AWS US-East-1',
      owner: 'Cloud Team',
      ip_address: 'N/A',
      last_scan: '2024-01-20T08:30:00Z',
      vulnerabilities: 0,
      risk_score: 30,
      tags: ['cloud', 's3', 'encrypted']
    },
    {
      id: '6',
      name: 'Development Server',
      type: 'server',
      category: 'medium',
      status: 'operational',
      location: 'Development Lab',
      owner: 'Development Team',
      ip_address: '192.168.2.100',
      last_scan: '2024-01-20T12:00:00Z',
      vulnerabilities: 5,
      risk_score: 65,
      tags: ['development', 'testing', 'non-production']
    },
    {
      id: '7',
      name: 'Backup Database',
      type: 'database',
      category: 'high',
      status: 'operational',
      location: 'Data Center B',
      owner: 'Database Team',
      ip_address: '192.168.1.103',
      last_scan: '2024-01-20T07:00:00Z',
      vulnerabilities: 1,
      risk_score: 40,
      tags: ['backup', 'disaster-recovery', 'encrypted']
    },
    {
      id: '8',
      name: 'VPN Server',
      type: 'network',
      category: 'high',
      status: 'operational',
      location: 'Network Operations',
      owner: 'Network Team',
      ip_address: '192.168.1.104',
      last_scan: '2024-01-20T13:30:00Z',
      vulnerabilities: 2,
      risk_score: 70,
      tags: ['vpn', 'remote-access', 'ssl']
    }
  ];

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAssets(mockAssets);
        setFilteredAssets(mockAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    let filtered = assets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ip_address.includes(searchTerm) ||
        asset.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedType, selectedCategory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return Server;
      case 'database': return Database;
      case 'network': return Network;
      case 'application': return Globe;
      case 'endpoint': return Users;
      case 'cloud': return Building;
      default: return HardDrive;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'degraded': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const assetDate = new Date(dateString);
    const diffMs = now.getTime() - assetDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const assetTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'server', label: 'Servers' },
    { value: 'database', label: 'Databases' },
    { value: 'network', label: 'Network' },
    { value: 'application', label: 'Applications' },
    { value: 'endpoint', label: 'Endpoints' },
    { value: 'cloud', label: 'Cloud' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Assets</h1>
          <p className="text-gray-600">Manage and monitor IT security assets</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {assets.filter(a => a.category === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Assets</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {assets.filter(a => a.risk_score >= 70).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk score ≥ 70
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assets.filter(a => a.status === 'operational').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((assets.filter(a => a.status === 'operational').length / assets.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                {assetTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const TypeIcon = getTypeIcon(asset.type);
          return (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {asset.ip_address} • {asset.location}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Owner:</span>
                  <span className="text-sm font-medium">{asset.owner}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge className={getCategoryColor(asset.category)}>
                    {asset.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Score:</span>
                  <span className={`text-sm font-medium ${getRiskScoreColor(asset.risk_score)}`}>
                    {asset.risk_score}/100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vulnerabilities:</span>
                  <span className={`text-sm font-medium ${asset.vulnerabilities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {asset.vulnerabilities}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Scan:</span>
                  <span className="text-sm text-gray-500">
                    {getTimeAgo(asset.last_scan)}
                  </span>
                </div>

                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityAssets;
