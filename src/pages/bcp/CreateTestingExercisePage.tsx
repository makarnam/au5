import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { bcpService } from '../../services/bcpService';
import { CreateTestingExerciseForm } from '../../types/bcp';

const CreateTestingExercisePage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateTestingExerciseForm>({
    exercise_name: '',
    exercise_type: 'tabletop',
    description: '',
    objectives: '',
    scope: '',
    participants: '',
    exercise_date: null,
    duration_hours: 2,
    success_criteria: '',
    results: '',
    lessons_learned: '',
    recommendations: '',
    action_items: '',
    next_exercise_date: null,
    status: 'planned',
    notes: ''
  });

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      const planData = await bcpService.getPlanById(planId!);
      setPlan(planData);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    setLoading(true);
    try {
      await bcpService.createTestingExercise({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating testing exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTestingExerciseForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!plan) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Testing Exercise</h1>
            <p className="text-muted-foreground">
              Add a testing exercise to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Information */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise Information</CardTitle>
              <CardDescription>Define the testing exercise details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exercise_name">Exercise Name *</Label>
                <Input
                  id="exercise_name"
                  value={formData.exercise_name}
                  onChange={(e) => handleInputChange('exercise_name', e.target.value)}
                  placeholder="e.g., Annual BCP Tabletop Exercise"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise_type">Exercise Type *</Label>
                <Select
                  value={formData.exercise_type}
                  onValueChange={(value) => handleInputChange('exercise_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tabletop">Tabletop Exercise</SelectItem>
                    <SelectItem value="walkthrough">Walkthrough Exercise</SelectItem>
                    <SelectItem value="simulation">Simulation Exercise</SelectItem>
                    <SelectItem value="full_scale">Full-Scale Exercise</SelectItem>
                    <SelectItem value="functional">Functional Exercise</SelectItem>
                    <SelectItem value="drill">Drill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the testing exercise and its purpose"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Details */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise Details</CardTitle>
              <CardDescription>Objectives, scope, and participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objectives">Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange('objectives', e.target.value)}
                  placeholder="List the specific objectives of this exercise"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Textarea
                  id="scope"
                  value={formData.scope}
                  onChange={(e) => handleInputChange('scope', e.target.value)}
                  placeholder="Define the scope and boundaries of the exercise"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Participants</Label>
                <Textarea
                  id="participants"
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  placeholder="List participants and their roles"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                  placeholder="2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Exercise dates and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exercise_date">Exercise Date</Label>
                <Input
                  id="exercise_date"
                  type="date"
                  value={formData.exercise_date || ''}
                  onChange={(e) => handleInputChange('exercise_date', e.target.value || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_exercise_date">Next Exercise Date</Label>
                <Input
                  id="next_exercise_date"
                  type="date"
                  value={formData.next_exercise_date || ''}
                  onChange={(e) => handleInputChange('next_exercise_date', e.target.value || null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Success Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Success Criteria</CardTitle>
              <CardDescription>Define what constitutes success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="success_criteria">Success Criteria</Label>
                <Textarea
                  id="success_criteria"
                  value={formData.success_criteria}
                  onChange={(e) => handleInputChange('success_criteria', e.target.value)}
                  placeholder="Define measurable success criteria for the exercise"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results & Lessons Learned */}
          <Card>
            <CardHeader>
              <CardTitle>Results & Lessons Learned</CardTitle>
              <CardDescription>Exercise outcomes and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="results">Exercise Results</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={(e) => handleInputChange('results', e.target.value)}
                  placeholder="Document the results and outcomes of the exercise"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessons_learned">Lessons Learned</Label>
                <Textarea
                  id="lessons_learned"
                  value={formData.lessons_learned}
                  onChange={(e) => handleInputChange('lessons_learned', e.target.value)}
                  placeholder="Key lessons learned from the exercise"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations & Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations & Actions</CardTitle>
              <CardDescription>Follow-up actions and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  placeholder="Recommendations for improvement"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_items">Action Items</Label>
                <Textarea
                  id="action_items"
                  value={formData.action_items}
                  onChange={(e) => handleInputChange('action_items', e.target.value)}
                  placeholder="Specific action items and follow-up tasks"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information or notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes, observations, or important information"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Testing Exercise'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTestingExercisePage;
