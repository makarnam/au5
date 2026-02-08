import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  FileText,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainingService, Certification, UserCertification } from '../../services/trainingService';

interface CertificationTrackingProps {
  userId?: string;
}

const CertificationTracking: React.FC<CertificationTrackingProps> = ({ userId }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [formData, setFormData] = useState<Partial<Certification>>({
    name: '',
    description: '',
    issuing_authority: '',
    certification_type: 'internal',
    validity_period_months: 12,
    renewal_required: true
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    user_id: '',
    certification_id: '',
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, typeFilter, statusFilter, userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load certifications
      const certFilters: any = {};
      if (typeFilter !== 'all') {
        certFilters.certification_type = typeFilter;
      }

      const { data: certData, error: certError } = await trainingService.getCertifications(certFilters, 1, 50);
      if (certError) throw certError;

      // Filter by search term
      let filteredCerts = certData;
      if (searchTerm) {
        filteredCerts = certData.filter(cert =>
          cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setCertifications(filteredCerts);

      // Load user certifications
      const userCertFilters: any = {};
      if (userId) {
        userCertFilters.user_id = userId;
      }
      if (statusFilter !== 'all') {
        userCertFilters.status = statusFilter;
      }

      const { data: userCertData, error: userCertError } = await trainingService.getUserCertifications(userId, userCertFilters, 1, 50);
      if (userCertError) throw userCertError;

      setUserCertifications(userCertData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load certification data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertification = async () => {
    try {
      if (!formData.name || !formData.issuing_authority) {
        toast.error('Name and issuing authority are required');
        return;
      }

      const { data, error } = await trainingService.createCertification(formData as Omit<Certification, 'id' | 'created_at' | 'updated_at'>);

      if (error) throw error;

      toast.success('Certification created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating certification:', error);
      toast.error('Failed to create certification');
    }
  };

  const handleUpdateCertification = async () => {
    try {
      if (!editingCertification || !formData.name || !formData.issuing_authority) {
        toast.error('Name and issuing authority are required');
        return;
      }

      const { data, error } = await trainingService.updateCertification(editingCertification.id, formData);

      if (error) throw error;

      toast.success('Certification updated successfully');
      setEditingCertification(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating certification:', error);
      toast.error('Failed to update certification');
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      const { error } = await trainingService.deleteCertification(id);

      if (error) throw error;

      toast.success('Certification deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error('Failed to delete certification');
    }
  };

  const handleAssignCertification = async () => {
    try {
      if (!assignmentFormData.user_id || !assignmentFormData.certification_id || !assignmentFormData.issue_date) {
        toast.error('User, certification, and issue date are required');
        return;
      }

      const { data, error } = await trainingService.createUserCertification({
        user_id: assignmentFormData.user_id,
        certification_id: assignmentFormData.certification_id,
        issue_date: assignmentFormData.issue_date,
        expiry_date: assignmentFormData.expiry_date || undefined,
        certificate_number: assignmentFormData.certificate_number || undefined,
        status: 'active',
        notes: assignmentFormData.notes || undefined
      });

      if (error) throw error;

      toast.success('Certification assigned successfully');
      setIsAssignDialogOpen(false);
      resetAssignmentForm();
      loadData();
    } catch (error) {
      console.error('Error assigning certification:', error);
      toast.error('Failed to assign certification');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      issuing_authority: '',
      certification_type: 'internal',
      validity_period_months: 12,
      renewal_required: true
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      user_id: '',
      certification_id: '',
      issue_date: '',
      expiry_date: '',
      certificate_number: '',
      notes: ''
    });
  };

  const openEditDialog = (certification: Certification) => {
    setEditingCertification(certification);
    setFormData({
      name: certification.name,
      description: certification.description || '',
      issuing_authority: certification.issuing_authority,
      certification_type: certification.certification_type,
      validity_period_months: certification.validity_period_months || 12,
      renewal_required: certification.renewal_required,
      prerequisites: certification.prerequisites || [],
      required_training_modules: certification.required_training_modules || []
    });
  };

  const openAssignDialog = (certification: Certification) => {
    setSelectedCertification(certification);
    setAssignmentFormData({
      ...assignmentFormData,
      certification_id: certification.id
    });
    setIsAssignDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-purple-100 text-purple-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { status: 'expired', color: 'text-red-600' };
    if (days <= 30) return { status: 'expiring_soon', color: 'text-orange-600' };
    return { status: 'valid', color: 'text-green-600' };
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Certification Tracking
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {userId ? 'Manage user certifications' : 'Track and manage certifications across the organization'}
          </p>
        </div>

        <div className='flex gap-2'>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create Certification</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='name'>Name *</Label>
                    <Input
                      id='name'
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder='Certification name'
                    />
                  </div>
                  <div>
                    <Label htmlFor='issuing_authority'>Issuing Authority *</Label>
                    <Input
                      id='issuing_authority'
                      value={formData.issuing_authority || ''}
                      onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                      placeholder='e.g., ISO, NIST'
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder='Certification description'
                    rows={3}
                  />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <Label>Certification Type</Label>
                    <Select value={formData.certification_type} onValueChange={(value: any) => setFormData({ ...formData, certification_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='internal'>Internal</SelectItem>
                        <SelectItem value='external'>External</SelectItem>
                        <SelectItem value='compliance'>Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Validity Period (months)</Label>
                    <Input
                      type='number'
                      value={formData.validity_period_months || ''}
                      onChange={(e) => setFormData({ ...formData, validity_period_months: parseInt(e.target.value) || 12 })}
                      placeholder='12'
                    />
                  </div>
                  <div className='flex items-center space-x-2 pt-8'>
                    <Checkbox
                      checked={formData.renewal_required || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, renewal_required: checked as boolean })}
                    />
                    <Label>Renewal Required</Label>
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCertification}>
                    Create Certification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {!userId && (
            <Button variant='outline' onClick={() => setIsAssignDialogOpen(true)}>
              <User className='h-4 w-4 mr-2' />
              Assign Certification
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search certifications...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='internal'>Internal</SelectItem>
                <SelectItem value='external'>External</SelectItem>
                <SelectItem value='compliance'>Compliance</SelectItem>
              </SelectContent>
            </Select>
            {userId && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='expired'>Expired</SelectItem>
                  <SelectItem value='revoked'>Revoked</SelectItem>
                  <SelectItem value='pending_renewal'>Pending Renewal</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userId ? 'User Certifications' : 'Available Certifications'} ({userId ? userCertifications.length : certifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issuing Authority</TableHead>
                  {!userId && <TableHead>Validity</TableHead>}
                  {userId && <TableHead>Status</TableHead>}
                  {userId && <TableHead>Expiry Date</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(userId ? userCertifications : certifications).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Award className='h-5 w-5 text-blue-600' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {userId ? item.certifications?.name : item.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {userId ? item.certifications?.description : item.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(userId ? item.certifications?.certification_type : item.certification_type)}>
                        {userId ? item.certifications?.certification_type : item.certification_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userId ? item.certifications?.issuing_authority : item.issuing_authority}
                    </TableCell>
                    {!userId && (
                      <TableCell>
                        {item.validity_period_months ? `${item.validity_period_months} months` : 'N/A'}
                      </TableCell>
                    )}
                    {userId && (
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    )}
                    {userId && (
                      <TableCell>
                        {item.expiry_date ? (
                          <div className='flex items-center gap-2'>
                            <span className={`font-medium ${getExpiryStatus(item.expiry_date).color}`}>
                              {new Date(item.expiry_date).toLocaleDateString()}
                            </span>
                            {getExpiryStatus(item.expiry_date).status === 'expiring_soon' && (
                              <AlertTriangle className='h-4 w-4 text-orange-500' />
                            )}
                            {getExpiryStatus(item.expiry_date).status === 'expired' && (
                              <AlertTriangle className='h-4 w-4 text-red-500' />
                            )}
                          </div>
                        ) : (
                          <span className='text-gray-400'>No expiry</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        {!userId && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openAssignDialog(item)}
                            >
                              <User className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteCertification(item.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCertification} onOpenChange={(open) => !open && setEditingCertification(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Issuing Authority *</Label>
                <Input
                  value={formData.issuing_authority || ''}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label>Certification Type</Label>
                <Select value={formData.certification_type} onValueChange={(value: any) => setFormData({ ...formData, certification_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='internal'>Internal</SelectItem>
                    <SelectItem value='external'>External</SelectItem>
                    <SelectItem value='compliance'>Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validity Period (months)</Label>
                <Input
                  type='number'
                  value={formData.validity_period_months || ''}
                  onChange={(e) => setFormData({ ...formData, validity_period_months: parseInt(e.target.value) || 12 })}
                />
              </div>
              <div className='flex items-center space-x-2 pt-8'>
                <Checkbox
                  checked={formData.renewal_required || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, renewal_required: checked as boolean })}
                />
                <Label>Renewal Required</Label>
              </div>
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => { setEditingCertification(null); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCertification}>
                Update Certification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Certification Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Assign Certification</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>User ID *</Label>
                <Input
                  value={assignmentFormData.user_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, user_id: e.target.value })}
                  placeholder='User ID'
                />
              </div>
              <div>
                <Label>Certification</Label>
                <Select value={assignmentFormData.certification_id} onValueChange={(value) => setAssignmentFormData({ ...assignmentFormData, certification_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select certification' />
                  </SelectTrigger>
                  <SelectContent>
                    {certifications.map(cert => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Issue Date *</Label>
                <Input
                  type='date'
                  value={assignmentFormData.issue_date}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type='date'
                  value={assignmentFormData.expiry_date}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Certificate Number</Label>
              <Input
                value={assignmentFormData.certificate_number}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, certificate_number: e.target.value })}
                placeholder='Certificate number'
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={assignmentFormData.notes}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                placeholder='Additional notes'
                rows={3}
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => { setIsAssignDialogOpen(false); resetAssignmentForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAssignCertification}>
                Assign Certification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificationTracking;