import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Leaf, 
  Users, 
  Shield, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGProgram, ESGProgramType, ESGProgramStatus, ESGSearchParams } from '../../types';

interface ESGProgramsListProps {
  className?: string;
  onProgramSelect?: (program: ESGProgram) => void;
}

const ESGProgramsList: React.FC<ESGProgramsListProps> = ({ className, onProgramSelect }) => {
  const [programs, setPrograms] = useState<ESGProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    program_type?: ESGProgramType[];
    status?: ESGProgramStatus[];
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPrograms();
  }, [searchQuery, filters, currentPage]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const params: ESGSearchParams = {
        query: searchQuery || undefined,
        filters: {
          program_type: filters.program_type,
          status: filters.status,
        },
        page: currentPage,
        page_size: 10,
      };

      const response = await esgService.getESGPrograms(params);
      setPrograms(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading ESG programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgramTypeIcon = (type: ESGProgramType) => {
    switch (type) {
      case 'environmental':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'social':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'governance':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'integrated':
        return <Building2 className="h-4 w-4 text-gray-600" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ESGProgramStatus) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline',
      completed: 'default',
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProgramTypeBadge = (type: ESGProgramType) => {
    const colors = {
      environmental: 'bg-green-100 text-green-800',
      social: 'bg-blue-100 text-blue-800',
      governance: 'bg-purple-100 text-purple-800',
      integrated: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const handleFilterChange = (filterType: 'program_type' | 'status', value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value as any)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as any];
      
      return {
        ...prev,
        [filterType]: newValues.length > 0 ? newValues : undefined,
      };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Programs</h1>
          <p className="text-muted-foreground">
            Manage Environmental, Social, and Governance programs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
          <CardDescription>Find specific ESG programs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search programs by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Program Type</label>
              <div className="space-y-2">
                {(['environmental', 'social', 'governance', 'integrated'] as ESGProgramType[]).map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.program_type?.includes(type) || false}
                      onChange={() => handleFilterChange('program_type', type)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="space-y-2">
                {(['active', 'inactive', 'draft', 'completed'] as ESGProgramStatus[]).map((status) => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={() => handleFilterChange('status', status)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.program_type?.length || filters.status?.length || searchQuery) && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Programs List */}
      <div className="space-y-4">
        {programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No programs found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || filters.program_type?.length || filters.status?.length
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first ESG program.'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Program
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {programs.map((program) => (
              <Card 
                key={program.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onProgramSelect?.(program)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getProgramTypeIcon(program.program_type)}
                        <h3 className="text-lg font-semibold">{program.name}</h3>
                        {getStatusBadge(program.status)}
                        {getProgramTypeBadge(program.program_type)}
                      </div>
                      
                      {program.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {program.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {program.owner && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {program.owner.first_name} {program.owner.last_name}
                            </span>
                          </div>
                        )}
                        
                        {program.business_unit && (
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{program.business_unit.name}</span>
                          </div>
                        )}

                        {program.start_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Started {new Date(program.start_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {program.budget && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {program.budget.toLocaleString()} {program.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ESGProgramsList;
