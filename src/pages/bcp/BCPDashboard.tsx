import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessContinuityPlan } from '../../types/bcp';
import { bcpService, computeKpis, computePlanMetrics, filterAndSortPlans, PlanStatusFilter } from '../../services/bcpService';

const BCPDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<BusinessContinuityPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PlanStatusFilter>('all');
  const [owner, setOwner] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'readiness'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await bcpService.getPlans();
        setPlans(data);
      } catch (err) {
        setError('Failed to load business continuity plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleCreatePlan = () => {
    navigate('/bcp/create');
  };

  const handleViewPlan = (id: string) => {
    navigate(`/bcp/${id}`);
  };

  const filteredPlans = useMemo(
    () => filterAndSortPlans(plans, { query, status, owner, sortBy, sortDir }),
    [plans, query, status, owner, sortBy, sortDir]
  );

  const kpis = useMemo(() => computeKpis(filteredPlans), [filteredPlans]);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Business Continuity Plans</h1>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plans, owners, versions..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-9 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <span className="absolute left-2 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/></svg>
            </span>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as PlanStatusFilter)} className="border border-gray-300 rounded-md py-2 px-3 text-sm">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Filter by owner" className="border border-gray-300 rounded-md py-2 px-3 text-sm" />
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border border-gray-300 rounded-md py-2 px-3 text-sm">
              <option value="updated">Sort: Updated</option>
              <option value="name">Sort: Name</option>
              <option value="readiness">Sort: Readiness</option>
            </select>
            <button onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="border border-gray-300 rounded-md px-3 text-sm">
              {sortDir === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
        <button
          onClick={handleCreatePlan}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Plan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Plans', value: kpis.totalPlans },
          { label: 'Active', value: kpis.activePlans },
          { label: 'Draft', value: kpis.draftPlans },
          { label: 'Inactive', value: kpis.inactivePlans },
          { label: 'Avg Functions/Plan', value: kpis.avgCriticalFunctionsPerPlan },
          { label: 'Avg Contacts/Plan', value: kpis.avgContactsPerPlan },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No business continuity plans</h3>
          <p className="mt-2 text-gray-500">Get started by creating a new business continuity plan.</p>
          <div className="mt-6">
            <button
              onClick={handleCreatePlan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create Your First Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const metrics = computePlanMetrics(plan);
            return (
            <div 
              key={plan.id} 
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewPlan(plan.id)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 
                      plan.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {plan.status}
                  </span>
                </div>
                
                <p className="mt-2 text-gray-600 line-clamp-2">{plan.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">{plan.owner}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804V14a2 2 0 002 2h14a2 2 0 002-2V4.804A7.962 7.962 0 0014.5 4c-1.255 0-2.443.29-3.5.804V14a2 2 0 01-2 2H9a2 2 0 01-2-2V4.804z" />
                    </svg>
                    <span className="text-sm text-gray-600">{plan.version}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {metrics.criticalFunctionsCount} functions
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-sm text-gray-600">{metrics.emergencyContactsCount} contacts</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4a1 1 0 10-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V6z"/></svg>
                    <span className="text-sm text-gray-600">Score {metrics.readinessScore}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BCPDashboard;
