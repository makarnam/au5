import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BusinessContinuityPlan } from '../../types/bcp';
import { bcpService, computePlanMetrics } from '../../services/bcpService';

const PlanDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<BusinessContinuityPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await bcpService.getPlanById(id);
        if (data) {
          setPlan(data);
        } else {
          // Fallback: fetch all plans and find client-side (handles maybeSingle nulls/RLS quirks)
          const all = await bcpService.getPlans();
          const found = all.find((p) => p.id === id) || null;
          setPlan(found);
          if (!found) {
            setError('Business continuity plan not found');
          }
        }
      } catch (err) {
        console.error('Failed to load business continuity plan', err);
        try {
          // Try secondary fallback to reduce hard failures
          const all = await bcpService.getPlans();
          const found = all.find((p) => p.id === id) || null;
          setPlan(found);
          if (!found) setError('Business continuity plan not found');
        } catch (e2) {
          console.error('Secondary fallback failed', e2);
          setError('Failed to load business continuity plan');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Business continuity plan not found'}
      </div>
    );
  }

  const handleBack = () => {
    navigate('/bcp');
  };

  const metrics = useMemo(() => (plan ? computePlanMetrics(plan) : null), [plan]);
  const criticalFunctions = useMemo(() => (plan?.critical_functions ?? []), [plan]);
  const emergencyContacts = useMemo(() => (plan?.emergency_contacts ?? []), [plan]);
  const recoveryTimeObjectives = useMemo(() => (plan?.recovery_time_objectives ?? []), [plan]);

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };
  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Plans
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
        
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
            ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 
              plan.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {plan.status}
          </span>
          {metrics && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
              Readiness {metrics.readinessScore}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-900">{plan.description}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Owner</p>
                <p className="mt-1 text-gray-900">{plan.owner}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Version</p>
                <p className="mt-1 text-gray-900">{plan.version}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="mt-1 text-gray-900">{formatDate(plan.created_at)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Updated</p>
                <p className="mt-1 text-gray-900">{formatDate(plan.updated_at)}</p>
              </div>
              {metrics && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500">Functions</p>
                    <p className="text-lg font-semibold">{metrics.criticalFunctionsCount}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500">Contacts</p>
                    <p className="text-lg font-semibold">{metrics.emergencyContactsCount}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500">Avg RTO</p>
                    <p className="text-lg font-semibold">{metrics.averageRtoHours ?? '—'}h</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="text-xs text-gray-500">High Priority</p>
                    <p className="text-lg font-semibold">{metrics.highPriorityFunctions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Critical Functions</h2>
            {criticalFunctions.length > 0 ? (
              <div className="space-y-3">
                {criticalFunctions.map((functionItem) => (
                  <div key={functionItem.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{functionItem.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{functionItem.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {functionItem.recovery_priority}
                      </span>
                      <span className="text-sm text-gray-600">{functionItem.recovery_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No critical functions defined</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
          {emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{contact.role}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {contact.email}
                    </p>
                    <p className="text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {contact.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No emergency contacts defined</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recovery Time Objectives</h2>
          {recoveryTimeObjectives.length > 0 ? (
            <div className="space-y-3">
              {recoveryTimeObjectives.map((rto) => (
                <div key={rto.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">RTO: {rto.rto_hours} hours</h3>
                  <p className="text-sm text-gray-600 mt-1">RPO: {rto.rpo_hours} hours</p>
                  <p className="text-sm text-gray-600 mt-2">{rto.recovery_strategy}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recovery time objectives defined</p>
          )}
        </div>

        {/* World-class BCM enrichments (optional) */}
        {(plan.exercise_schedule?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercises</h2>
            <div className="space-y-3">
              {plan.exercise_schedule!.map((ex) => (
                <div key={ex.id} className="border rounded p-4">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900">{ex.name} • {ex.type}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${ex.status === 'completed' ? 'bg-green-100 text-green-800' : ex.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{ex.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">Scheduled: {formatDateTime(ex.scheduled_at)}</p>
                  {ex.findings && <p className="text-sm text-gray-600 mt-1">Findings: {ex.findings}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {(plan.communication_templates?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.communication_templates!.map((ct) => (
                <div key={ct.id} className="border rounded p-4">
                  <p className="font-medium text-gray-900">{ct.name} • {ct.channel}</p>
                  <p className="text-sm text-gray-600">Audience: {ct.audience}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ct.message}</p>
                  {ct.last_used_at && (
                    <p className="text-xs text-gray-500 mt-1">Last used {formatDate(ct.last_used_at)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetails;
