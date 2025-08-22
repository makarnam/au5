import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  Calendar, 
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Wand2,
  Shield,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import TrainingAIGenerator from "../../components/ai/TrainingAIGenerator";

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  targetAudience: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  assignedUsers: number;
  completionRate: number;
}

interface TrainingModule {
  id: string;
  programId: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'document' | 'interactive' | 'assessment';
  status: 'draft' | 'active' | 'completed';
  order: number;
}

interface TrainingAssignment {
  id: string;
  programId: string;
  userId: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  assignedAt: string;
  dueDate: string;
  completedAt?: string;
  progress: number;
}

const TrainingManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // AI Generation states
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string>("training_program");
  const [generatedContent, setGeneratedContent] = useState<string>("");

  // Mock data for demonstration
  useEffect(() => {
    const mockPrograms: TrainingProgram[] = [
      {
        id: "1",
        title: "Data Privacy Compliance Training",
        description: "Comprehensive training on GDPR, CCPA, and data protection regulations",
        type: "compliance",
        duration: "4 hours",
        targetAudience: ["All Employees", "Data Handlers"],
        status: "active",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T14:30:00Z",
        assignedUsers: 150,
        completionRate: 85
      },
      {
        id: "2",
        title: "Cybersecurity Awareness Training",
        description: "Essential cybersecurity practices and threat awareness",
        type: "security",
        duration: "2 hours",
        targetAudience: ["All Employees"],
        status: "active",
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-01-18T16:45:00Z",
        assignedUsers: 200,
        completionRate: 92
      },
      {
        id: "3",
        title: "Risk Management Fundamentals",
        description: "Introduction to enterprise risk management principles",
        type: "professional",
        duration: "6 hours",
        targetAudience: ["Managers", "Risk Officers"],
        status: "draft",
        created_at: "2024-01-25T11:00:00Z",
        updated_at: "2024-01-25T11:00:00Z",
        assignedUsers: 0,
        completionRate: 0
      }
    ];

    const mockModules: TrainingModule[] = [
      {
        id: "1",
        programId: "1",
        title: "Introduction to Data Privacy",
        description: "Overview of data privacy concepts and regulations",
        duration: "30 minutes",
        type: "video",
        status: "active",
        order: 1
      },
      {
        id: "2",
        programId: "1",
        title: "GDPR Requirements",
        description: "Detailed coverage of GDPR requirements and compliance",
        duration: "45 minutes",
        type: "interactive",
        status: "active",
        order: 2
      },
      {
        id: "3",
        programId: "1",
        title: "Data Protection Assessment",
        description: "Final assessment to validate understanding",
        duration: "15 minutes",
        type: "assessment",
        status: "active",
        order: 3
      }
    ];

    setTrainingPrograms(mockPrograms);
    setTrainingModules(mockModules);
    setLoading(false);
  }, []);

  const handleAIGeneration = (content: string) => {
    setGeneratedContent(content);
    toast.success("Training content generated successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compliance':
        return <Award className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'professional':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const filteredPrograms = trainingPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || program.status === filterStatus;
    const matchesType = filterType === "all" || program.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600">Comprehensive training and certification management system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowAIGenerator(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          <Button onClick={() => navigate("/training/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Training Content Generator</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAIGenerator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Program Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter training program title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="compliance">Compliance Training</option>
                      <option value="security">Security Training</option>
                      <option value="professional">Professional Development</option>
                      <option value="technical">Technical Training</option>
                    </select>
                  </div>
                </div>

                <TrainingAIGenerator
                  fieldType="training_program"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="training_description"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <TrainingAIGenerator
                  fieldType="learning_objectives"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="training_materials"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="training_schedule"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />
              </TabsContent>

              <TabsContent value="assessment" className="space-y-4">
                <TrainingAIGenerator
                  fieldType="assessment_criteria"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="certification_requirements"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />
              </TabsContent>

              <TabsContent value="evaluation" className="space-y-4">
                <TrainingAIGenerator
                  fieldType="training_evaluation"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="training_effectiveness"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />

                <TrainingAIGenerator
                  fieldType="competency_mapping"
                  title="Data Privacy Compliance Training"
                  industry="Technology"
                  trainingType="compliance"
                  targetAudience={["All Employees", "Data Handlers"]}
                  duration="4 hours"
                  onGenerated={handleAIGeneration}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPrograms.length}</div>
            <p className="text-xs text-muted-foreground">
              {trainingPrograms.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingModules.length}</div>
            <p className="text-xs text-muted-foreground">
              {trainingModules.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainingPrograms.reduce((sum, p) => sum + p.assignedUsers, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(trainingPrograms.reduce((sum, p) => sum + p.completionRate, 0) / trainingPrograms.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search training programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="compliance">Compliance</option>
            <option value="security">Security</option>
            <option value="professional">Professional</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Training Programs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(program.type)}
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(program.status)}>
                  {program.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {program.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{program.duration}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium">{program.assignedUsers} users</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">{program.completionRate}%</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Target:</span>
                  <div className="flex flex-wrap gap-1">
                    {program.targetAudience.map((audience, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/training/${program.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/training/${program.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/training/${program.id}/assign`)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No training programs found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== "all" || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first training program"}
          </p>
          <Button onClick={() => navigate("/training/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Training Program
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrainingManagementDashboard;
