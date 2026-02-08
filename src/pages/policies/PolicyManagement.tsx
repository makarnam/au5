import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Shield,
  FileCheck,
  Users,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import PolicyApprovalWorkflow from "../../components/policies/PolicyApprovalWorkflow";
import { policyService } from "../../services/policyService";
import type { Policy, PolicyVersion } from "../../types/policies";

const PolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    if (selectedPolicy) {
      loadPolicyVersions(selectedPolicy.id);
    }
  }, [selectedPolicy]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await policyService.listPolicies();
      if (error) throw error;

      // Transform data to include computed fields
      const transformedData = (data || []).map(policy => ({
        ...policy,
        status: 'draft' as const, // Default status
        owner_name: 'Unassigned', // Default owner
        version_count: 0, // Will be computed
        created_at: policy.created_at || new Date().toISOString(),
        updated_at: policy.updated_at || new Date().toISOString()
      }));

      setPolicies(transformedData);
      if (transformedData.length > 0 && !selectedPolicy) {
        setSelectedPolicy(transformedData[0]);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      // Fallback to mock data
      const mockPolicies = [
        {
          id: '1',
          name: 'Information Security Policy',
          description: 'Comprehensive information security policy for the organization',
          status: 'published' as const,
          owner_name: 'Security Team',
          version_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Data Privacy Policy',
          description: 'GDPR compliant data privacy and protection policy',
          status: 'draft' as const,
          owner_name: 'Compliance Team',
          version_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setPolicies(mockPolicies);
      if (!selectedPolicy) {
        setSelectedPolicy(mockPolicies[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPolicyVersions = async (policyId: string) => {
    try {
      const { data, error } = await policyService.listVersions(policyId);
      if (error) throw error;
      setPolicyVersions(data || []);
    } catch (error) {
      console.error('Error loading policy versions:', error);
      // Fallback to mock data
      const mockVersions = [
        {
          id: '1',
          policy_id: policyId,
          version_number: 1,
          title: 'Version 1.0',
          content: 'Policy content...',
          status: 'published' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setPolicyVersions(mockVersions);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      review: "outline",
      approved: "default",
      published: "default",
      archived: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Management System</h1>
          <p className="text-gray-600">
            Comprehensive policy management platform for creating, maintaining, and monitoring organizational policies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Approval Workflows <Badge variant="outline" className="ml-2">New</Badge></TabsTrigger>
          <TabsTrigger value="analytics">Analytics <Badge variant="outline" className="ml-2">New</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Library</CardTitle>
              <CardDescription>Search and filter policies in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Policies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPolicies.map((policy) => (
                  <Card
                    key={policy.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPolicy?.id === policy.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{policy.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {policy.description || 'No description available'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(policy.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span>{policy.owner_name || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>{new Date(policy.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Versions:</span>
                          <span>{policy.version_count || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPolicies.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No policies found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Details */}
          {selectedPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  {selectedPolicy.name} - Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedPolicy.description || 'No description provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Owner</label>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedPolicy.owner_name || 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedPolicy.status)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-600">
                        {new Date(selectedPolicy.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-600">
                        {new Date(selectedPolicy.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Versions</label>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedPolicy.version_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {selectedPolicy ? (
            <PolicyApprovalWorkflow
              policy={selectedPolicy}
              versions={policyVersions}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a policy to view approval workflows</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Policy analytics dashboard coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                Advanced analytics for policy compliance, effectiveness, and lifecycle management
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyManagement;
