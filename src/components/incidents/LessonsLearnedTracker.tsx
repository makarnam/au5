import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import incidentService, { IncidentLessonsLearned, ImplementationStatus } from "../../services/incidentService";

interface LessonsLearnedTrackerProps {
  incidentId: string;
}

const LessonsLearnedTracker: React.FC<LessonsLearnedTrackerProps> = ({ incidentId }) => {
  const [lessons, setLessons] = useState<IncidentLessonsLearned[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<IncidentLessonsLearned | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    impact_level: "",
    preventive_actions: "",
    responsible_party: "",
    implementation_status: "planned" as ImplementationStatus,
    due_date: "",
  });

  useEffect(() => {
    loadLessons();
  }, [incidentId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getLessonsLearned(incidentId);
      setLessons(data || []);
    } catch (error) {
      console.error("Error loading lessons learned:", error);
      toast.error("Failed to load lessons learned");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      impact_level: "",
      preventive_actions: "",
      responsible_party: "",
      implementation_status: "planned",
      due_date: "",
    });
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (editingLesson) {
        await incidentService.updateLessonsLearned(editingLesson.id, formData);
        toast.success("Lesson learned updated successfully");
      } else {
        await incidentService.addLessonsLearned(incidentId, formData);
        toast.success("Lesson learned added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadLessons();
    } catch (error) {
      console.error("Error saving lesson learned:", error);
      toast.error("Failed to save lesson learned");
    }
  };

  const handleEdit = (lesson: IncidentLessonsLearned) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      category: lesson.category || "",
      impact_level: lesson.impact_level || "",
      preventive_actions: lesson.preventive_actions || "",
      responsible_party: lesson.responsible_party || "",
      implementation_status: lesson.implementation_status || "planned",
      due_date: lesson.due_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson learned?")) {
      return;
    }

    try {
      await incidentService.deleteLessonsLearned(lessonId);
      toast.success("Lesson learned deleted successfully");
      loadLessons();
    } catch (error) {
      console.error("Error deleting lesson learned:", error);
      toast.error("Failed to delete lesson learned");
    }
  };

  const getStatusIcon = (status: ImplementationStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planned":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: ImplementationStatus) => {
    const variants = {
      planned: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lessons Learned
              <Badge variant="outline" className="ml-2">New</Badge>
            </CardTitle>
            <CardDescription>
              Track lessons learned and preventive actions from this incident
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingLesson ? "Edit Lesson Learned" : "Add New Lesson Learned"}
                </DialogTitle>
                <DialogDescription>
                  Document lessons learned and preventive actions to improve future incident response.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief title for the lesson"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Process, Technology, Human"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the lesson learned"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Impact Level</label>
                    <Select
                      value={formData.impact_level}
                      onValueChange={(value) => setFormData({ ...formData, impact_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Implementation Status</label>
                    <Select
                      value={formData.implementation_status}
                      onValueChange={(value) => setFormData({ ...formData, implementation_status: value as ImplementationStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Preventive Actions</label>
                  <Textarea
                    value={formData.preventive_actions}
                    onChange={(e) => setFormData({ ...formData, preventive_actions: e.target.value })}
                    placeholder="Specific actions to prevent similar incidents"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Responsible Party</label>
                    <Input
                      value={formData.responsible_party}
                      onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                      placeholder="Person or team responsible"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingLesson ? "Update" : "Add"} Lesson
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No lessons learned documented yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by adding lessons learned from this incident to improve future response.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>{lesson.category || "-"}</TableCell>
                  <TableCell>
                    {lesson.impact_level && (
                      <Badge variant="outline">
                        {lesson.impact_level.toUpperCase()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lesson.implementation_status || "planned")}
                      {getStatusBadge(lesson.implementation_status || "planned")}
                    </div>
                  </TableCell>
                  <TableCell>{lesson.responsible_party || "-"}</TableCell>
                  <TableCell>
                    {lesson.due_date ? new Date(lesson.due_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lesson.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonsLearnedTracker;