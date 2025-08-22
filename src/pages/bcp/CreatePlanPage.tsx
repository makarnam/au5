import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bcpService } from '../../services/bcpService';
import { BusinessContinuityPlan, CriticalFunction, EmergencyContact, RecoveryTimeObjective } from '../../types/bcp';
import BCPAIGenerator from '../../components/ai/BCPAIGenerator';

const CreatePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Omit<BusinessContinuityPlan, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    status: 'draft',
    owner: '',
    version: '1.0',
    critical_functions: [],
    emergency_contacts: [],
    recovery_time_objectives: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newFunction, setNewFunction] = useState<Omit<CriticalFunction, 'id'>>({
    name: '',
    description: '',
    dependencies: [],
    recovery_time: '',
    recovery_priority: 'medium',
  });
  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: '',
  });
  const [newRto, setNewRto] = useState<Omit<RecoveryTimeObjective, 'id'>>({
    function_id: '',
    rto_hours: 8,
    rpo_hours: 4,
    recovery_strategy: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await bcpService.createPlan(plan);
      navigate('/bcp');
    } catch (err) {
      setError('Failed to create business continuity plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Business Continuity Plan</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Plan Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={plan.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <BCPAIGenerator
                fieldType="bcp_description"
                bcpData={plan}
                onGenerated={(content) => {
                  if (typeof content === 'string') {
                    setPlan(prev => ({ ...prev, description: content }));
                  }
                }}
                className="ml-2"
              />
            </div>
            <textarea
              id="description"
              name="description"
              value={plan.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner</label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={plan.owner}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={plan.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
            <input
              type="text"
              id="version"
              name="version"
              value={plan.version}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Inline builders for critical functions, contacts, and RTOs */}
          <div className="border-t border-gray-100 pt-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Critical Functions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Name" value={newFunction.name} onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })} />
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Recovery time (e.g., 8h)" value={newFunction.recovery_time} onChange={(e) => setNewFunction({ ...newFunction, recovery_time: e.target.value })} />
                <select className="border rounded-md py-2 px-3 text-sm" value={newFunction.recovery_priority} onChange={(e) => setNewFunction({ ...newFunction, recovery_priority: e.target.value as any })}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input className="md:col-span-3 border rounded-md py-2 px-3 text-sm" placeholder="Description" value={newFunction.description} onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })} />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => {
                    if (!newFunction.name) return;
                    setPlan((prev) => ({
                      ...prev,
                      critical_functions: [
                        ...prev.critical_functions,
                        { id: crypto.randomUUID(), ...newFunction },
                      ],
                    }));
                    setNewFunction({ name: '', description: '', dependencies: [], recovery_time: '', recovery_priority: 'medium' });
                  }}
                >
                  Add Function
                </button>
              </div>
              {plan.critical_functions.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {plan.critical_functions.map((f) => (
                    <li key={f.id} className="flex justify-between items-center border rounded-md px-3 py-2 text-sm">
                      <span className="truncate">{f.name} • {f.recovery_priority} • {f.recovery_time}</span>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => setPlan((prev) => ({ ...prev, critical_functions: prev.critical_functions.filter((x) => x.id !== f.id) }))}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Role" value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => {
                    if (!newContact.name) return;
                    setPlan((prev) => ({
                      ...prev,
                      emergency_contacts: [
                        ...prev.emergency_contacts,
                        { id: crypto.randomUUID(), ...newContact },
                      ],
                    }));
                    setNewContact({ name: '', email: '', phone: '', role: '' });
                  }}
                >
                  Add Contact
                </button>
              </div>
              {plan.emergency_contacts.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {plan.emergency_contacts.map((c) => (
                    <li key={c.id} className="flex justify-between items-center border rounded-md px-3 py-2 text-sm">
                      <span className="truncate">{c.name} • {c.role} • {c.phone}</span>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => setPlan((prev) => ({ ...prev, emergency_contacts: prev.emergency_contacts.filter((x) => x.id !== c.id) }))}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recovery Time Objectives</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  className="border rounded-md py-2 px-3 text-sm"
                  value={newRto.function_id}
                  onChange={(e) => setNewRto({ ...newRto, function_id: e.target.value })}
                >
                  <option value="">Select Function</option>
                  {plan.critical_functions.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <input type="number" min={0} className="border rounded-md py-2 px-3 text-sm" placeholder="RTO (hours)" value={newRto.rto_hours} onChange={(e) => setNewRto({ ...newRto, rto_hours: Number(e.target.value) })} />
                <input type="number" min={0} className="border rounded-md py-2 px-3 text-sm" placeholder="RPO (hours)" value={newRto.rpo_hours} onChange={(e) => setNewRto({ ...newRto, rpo_hours: Number(e.target.value) })} />
                <input className="border rounded-md py-2 px-3 text-sm" placeholder="Recovery strategy" value={newRto.recovery_strategy} onChange={(e) => setNewRto({ ...newRto, recovery_strategy: e.target.value })} />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded"
                  onClick={() => {
                    if (!newRto.function_id) return;
                    setPlan((prev) => ({
                      ...prev,
                      recovery_time_objectives: [
                        ...prev.recovery_time_objectives,
                        { id: crypto.randomUUID(), ...newRto },
                      ],
                    }));
                    setNewRto({ function_id: '', rto_hours: 8, rpo_hours: 4, recovery_strategy: '' });
                  }}
                >
                  Add RTO
                </button>
              </div>
              {plan.recovery_time_objectives.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {plan.recovery_time_objectives.map((r) => (
                    <li key={r.id} className="flex justify-between items-center border rounded-md px-3 py-2 text-sm">
                      <span className="truncate">{r.rto_hours}h RTO • {r.rpo_hours}h RPO • {r.recovery_strategy}</span>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => setPlan((prev) => ({ ...prev, recovery_time_objectives: prev.recovery_time_objectives.filter((x) => x.id !== r.id) }))}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/bcp')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanPage;
