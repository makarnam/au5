import React, { useMemo, useState } from "react";
import { BookOpen, Building2, Users, Globe, Database, Plus, Search } from "lucide-react";

type ProcessingActivity = {
  id: string;
  name: string;
  purpose: string;
  controller: string;
  processor?: string;
  dataSubjects: string[];
  dataCategories: string[];
  recipients?: string[];
  transfers?: string[]; // Third countries or international orgs
  retention: string;
  legalBasis: string;
};

const seed: ProcessingActivity[] = [
  {
    id: "ropa-1",
    name: "Customer Relationship Management",
    purpose: "Manage customer interactions, support and marketing",
    controller: "ACME Corp",
    processor: "SalesCloud Inc.",
    dataSubjects: ["Customers", "Leads"],
    dataCategories: ["Identification", "Contact", "Usage"],
    recipients: ["Marketing Partners"],
    transfers: ["US"],
    retention: "36 months from last interaction",
    legalBasis: "Legitimate interests",
  },
  {
    id: "ropa-2",
    name: "HR Payroll",
    purpose: "Process payroll and statutory reporting",
    controller: "ACME Corp",
    dataSubjects: ["Employees"],
    dataCategories: ["Identification", "Financial"],
    recipients: ["Tax Authority"],
    retention: "7 years post-employment",
    legalBasis: "Legal obligation",
  },
];

export default function RoPARegister() {
  const [activities, setActivities] = useState<ProcessingActivity[]>(seed);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.filter((a) =>
      !term || a.name.toLowerCase().includes(term) || a.purpose.toLowerCase().includes(term),
    );
  }, [activities, search]);

  const addActivity = () => {
    const id = `ropa-${Math.random().toString(36).slice(2, 8)}`;
    setActivities((prev) => [
      {
        id,
        name: "New Processing Activity",
        purpose: "Describe why data is processed",
        controller: "",
        processor: "",
        dataSubjects: [],
        dataCategories: [],
        recipients: [],
        transfers: [],
        retention: "",
        legalBasis: "",
      },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" /> Records of Processing Activities (RoPA)
          </h1>
          <p className="text-gray-600 mt-2">Maintain a structured register of processing activities per GDPR Art. 30.</p>
        </div>
        <button onClick={addActivity} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Activity
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities"
            className="pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Controller/Processor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects & Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients/Transfers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention/Basis</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" /> {a.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{a.purpose}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> {a.controller || "-"}</div>
                  {a.processor && (
                    <div className="text-xs text-gray-600 ml-6">Processor: {a.processor}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> {a.dataSubjects.join(", ") || "-"}</div>
                  <div className="text-xs text-gray-600 ml-6">Data: {a.dataCategories.join(", ") || "-"}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>Recipients: {a.recipients?.join(", ") || "-"}</div>
                  <div className="text-xs text-gray-600">Transfers: {a.transfers?.join(", ") || "-"}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>Retention: {a.retention || "-"}</div>
                  <div className="text-xs text-gray-600">Legal basis: {a.legalBasis || "-"}</div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No processing activities found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
