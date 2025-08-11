import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Building2, 
  Save, 
  ArrowLeft, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle,
  ChevronRight, 
  ChevronLeft, 
  Check,
  User,
  Phone,
  Mail,
  Globe,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Award,
  Settings,
  Info
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyFormData } from '../../types/thirdPartyRiskManagement';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Form schema with validation
const schema = z.object({
  // Step 1: Basic Information
  name: z.string().min(1, "Third party name is required"),
  legal_name: z.string().optional(),
  vendor_id: z.string().optional(),
  vendor_type: z.string().min(1, "Vendor type is required"),
  industry: z.string().optional(),
  business_unit_id: z.string().optional(),
  risk_classification: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'inactive', 'suspended', 'terminated']),
  
  // Step 2: Contact Information
  contact_person: z.string().optional(),
  contact_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  address: z.string().optional(),
  country: z.string().optional(),
  
  // Step 3: Business Information
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  annual_revenue: z.number().nullable().optional(),
  employee_count: z.number().nullable().optional(),
  founded_year: z.number().nullable().optional(),
  financial_stability_rating: z.string().optional(),
  credit_rating: z.string().optional(),
  
  // Step 4: Contract Information
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
  renewal_date: z.string().optional(),
  contract_value: z.number().nullable().optional(),
  currency: z.string(),
  payment_terms: z.string().optional(),
  assessment_frequency_months: z.number().min(1).max(60),
  sla_requirements: z.string().optional(),
  insurance_coverage: z.string().optional(),
  
  // Step 5: Certifications & Services
  certifications: z.array(z.string()).optional(),
  compliance_frameworks: z.array(z.string()).optional(),
  data_processing_activities: z.array(z.string()).optional(),
  critical_services: z.array(z.string()).optional(),
  
  // Step 6: Additional Information
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const vendorTypes = [
  'supplier', 'service_provider', 'contractor', 'partner', 'consultant',
  'vendor', 'distributor', 'manufacturer', 'logistics', 'technology'
];

const riskClassifications = ['low', 'medium', 'high', 'critical'];
const statuses = ['active', 'inactive', 'suspended', 'terminated'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];

const steps = [
  { id: 1, name: "Basic Info", icon: Building2, description: "Essential company information" },
  { id: 2, name: "Contact", icon: User, description: "Contact details and location" },
  { id: 3, name: "Business", icon: FileText, description: "Business and financial details" },
  { id: 4, name: "Contract", icon: Calendar, description: "Contract and payment terms" },
  { id: 5, name: "Certifications", icon: Award, description: "Certifications and services" },
  { id: 6, name: "Review", icon: Check, description: "Review and submit" },
];

interface ThirdPartyWizardProps {
  onComplete?: () => void;
}

export default function ThirdPartyWizard({ onComplete }: ThirdPartyWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  
  // Array field states
  const [newCertification, setNewCertification] = useState('');
  const [newComplianceFramework, setNewComplianceFramework] = useState('');
  const [newDataProcessingActivity, setNewDataProcessingActivity] = useState('');
  const [newCriticalService, setNewCriticalService] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      legal_name: '',
      vendor_id: '',
      vendor_type: 'supplier',
      industry: '',
      business_unit_id: '',
      risk_classification: 'medium',
      status: 'active',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      address: '',
      country: '',
      registration_number: '',
      tax_id: '',
      annual_revenue: null,
      employee_count: null,
      founded_year: null,
      certifications: [],
      compliance_frameworks: [],
      data_processing_activities: [],
      critical_services: [],
      contract_start_date: '',
      contract_end_date: '',
      renewal_date: '',
      contract_value: null,
      currency: 'USD',
      payment_terms: '',
      sla_requirements: '',
      insurance_coverage: '',
      financial_stability_rating: '',
      credit_rating: '',
      assessment_frequency_months: 12,
      notes: ''
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    loadBusinessUnits();
  }, []);

  const loadBusinessUnits = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getBusinessUnits();
      if (!result.error) {
        setBusinessUnits(result.data);
      }
    } catch (err) {
      console.error('Failed to load business units:', err);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleArrayFieldAdd = (field: keyof FormData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = watchedValues[field] as string[] || [];
      setValue(field as any, [...currentArray, value.trim()]);
      setter('');
    }
  };

  const handleArrayFieldRemove = (field: keyof FormData, index: number) => {
    const currentArray = watchedValues[field] as string[] || [];
    setValue(field as any, currentArray.filter((_, i) => i !== index));
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await thirdPartyRiskManagementService.createThirdParty(data);
      
      if (result.error) {
        throw new Error('Failed to create third party');
      }

      toast.success('Third party created successfully!');
      onComplete?.();
      navigate('/third-party-risk-management/catalog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Basic Information
              </h3>
              <p className="text-gray-600">
                Provide essential details about the third party
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center">
                  Third Party Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter third party name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="legal_name">Legal Name</Label>
                <Input
                  id="legal_name"
                  {...register("legal_name")}
                  placeholder="Enter legal name"
                />
              </div>

              <div>
                <Label htmlFor="vendor_id">Vendor ID</Label>
                <Input
                  id="vendor_id"
                  {...register("vendor_id")}
                  placeholder="Enter vendor ID"
                />
              </div>

              <div>
                <Label htmlFor="vendor_type" className="flex items-center">
                  Vendor Type <span className="text-red-500 ml-1">*</span>
                </Label>
                <select
                  id="vendor_type"
                  {...register("vendor_type")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {vendorTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
                {errors.vendor_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.vendor_type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...register("industry")}
                  placeholder="Enter industry"
                />
              </div>

              <div>
                <Label htmlFor="business_unit_id">Business Unit</Label>
                <select
                  id="business_unit_id"
                  {...register("business_unit_id")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select business unit</option>
                  {businessUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="risk_classification">Risk Classification</Label>
                <select
                  id="risk_classification"
                  {...register("risk_classification")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {riskClassifications.map(classification => (
                    <option key={classification} value={classification}>
                      {classification.charAt(0).toUpperCase() + classification.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="mt-1">
                  <Badge className={getRiskLevelColor(watchedValues.risk_classification)}>
                    {watchedValues.risk_classification?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Contact Information
              </h3>
              <p className="text-gray-600">
                Provide contact details and location information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  {...register("contact_person")}
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="Enter contact email"
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  {...register("contact_phone")}
                  placeholder="Enter contact phone"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register("website")}
                  placeholder="Enter website URL"
                />
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("country")}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Business Information
              </h3>
              <p className="text-gray-600">
                Provide business and financial details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  {...register("registration_number")}
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  {...register("tax_id")}
                  placeholder="Enter tax ID"
                />
              </div>

              <div>
                <Label htmlFor="annual_revenue">Annual Revenue</Label>
                <Input
                  id="annual_revenue"
                  type="number"
                  {...register("annual_revenue", { valueAsNumber: true })}
                  placeholder="Enter annual revenue"
                />
              </div>

              <div>
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input
                  id="employee_count"
                  type="number"
                  {...register("employee_count", { valueAsNumber: true })}
                  placeholder="Enter employee count"
                />
              </div>

              <div>
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  type="number"
                  {...register("founded_year", { valueAsNumber: true })}
                  placeholder="Enter founded year"
                />
              </div>

              <div>
                <Label htmlFor="financial_stability_rating">Financial Stability Rating</Label>
                <Input
                  id="financial_stability_rating"
                  {...register("financial_stability_rating")}
                  placeholder="Enter financial stability rating"
                />
              </div>

              <div>
                <Label htmlFor="credit_rating">Credit Rating</Label>
                <Input
                  id="credit_rating"
                  {...register("credit_rating")}
                  placeholder="Enter credit rating"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Contract Information
              </h3>
              <p className="text-gray-600">
                Provide contract and payment details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_start_date">Contract Start Date</Label>
                <Input
                  id="contract_start_date"
                  type="date"
                  {...register("contract_start_date")}
                />
              </div>

              <div>
                <Label htmlFor="contract_end_date">Contract End Date</Label>
                <Input
                  id="contract_end_date"
                  type="date"
                  {...register("contract_end_date")}
                />
              </div>

              <div>
                <Label htmlFor="renewal_date">Renewal Date</Label>
                <Input
                  id="renewal_date"
                  type="date"
                  {...register("renewal_date")}
                />
              </div>

              <div>
                <Label htmlFor="contract_value">Contract Value</Label>
                <div className="flex space-x-2">
                  <Input
                    id="contract_value"
                    type="number"
                    {...register("contract_value", { valueAsNumber: true })}
                    placeholder="Enter contract value"
                  />
                  <select
                    {...register("currency")}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  {...register("payment_terms")}
                  placeholder="Enter payment terms"
                />
              </div>

              <div>
                <Label htmlFor="assessment_frequency_months">Assessment Frequency (months)</Label>
                <Input
                  id="assessment_frequency_months"
                  type="number"
                  {...register("assessment_frequency_months", { valueAsNumber: true })}
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sla_requirements">SLA Requirements</Label>
              <Textarea
                id="sla_requirements"
                {...register("sla_requirements")}
                placeholder="Enter SLA requirements"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="insurance_coverage">Insurance Coverage</Label>
              <Textarea
                id="insurance_coverage"
                {...register("insurance_coverage")}
                placeholder="Enter insurance coverage details"
                rows={3}
              />
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Certifications & Services
              </h3>
              <p className="text-gray-600">
                Add certifications, frameworks, and critical services
              </p>
            </div>

            {/* Certifications */}
            <div>
              <Label>Certifications</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add certification"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayFieldAdd('certifications', newCertification, setNewCertification)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayFieldAdd('certifications', newCertification, setNewCertification)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.certifications?.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayFieldRemove('certifications', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Compliance Frameworks */}
            <div>
              <Label>Compliance Frameworks</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newComplianceFramework}
                  onChange={(e) => setNewComplianceFramework(e.target.value)}
                  placeholder="Add compliance framework"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayFieldAdd('compliance_frameworks', newComplianceFramework, setNewComplianceFramework)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayFieldAdd('compliance_frameworks', newComplianceFramework, setNewComplianceFramework)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.compliance_frameworks?.map((framework, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{framework}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayFieldRemove('compliance_frameworks', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Data Processing Activities */}
            <div>
              <Label>Data Processing Activities</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newDataProcessingActivity}
                  onChange={(e) => setNewDataProcessingActivity(e.target.value)}
                  placeholder="Add data processing activity"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayFieldAdd('data_processing_activities', newDataProcessingActivity, setNewDataProcessingActivity)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayFieldAdd('data_processing_activities', newDataProcessingActivity, setNewDataProcessingActivity)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.data_processing_activities?.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{activity}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayFieldRemove('data_processing_activities', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Critical Services */}
            <div>
              <Label>Critical Services</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newCriticalService}
                  onChange={(e) => setNewCriticalService(e.target.value)}
                  placeholder="Add critical service"
                  onKeyPress={(e) => e.key === 'Enter' && handleArrayFieldAdd('critical_services', newCriticalService, setNewCriticalService)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayFieldAdd('critical_services', newCriticalService, setNewCriticalService)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.critical_services?.map((service, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{service}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayFieldRemove('critical_services', index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Review & Submit
              </h3>
              <p className="text-gray-600">
                Review all information before creating the third party
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Enter any additional notes or comments"
                rows={4}
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Name:</strong> {watchedValues.name}</p>
                  <p><strong>Type:</strong> {watchedValues.vendor_type?.replace('_', ' ')}</p>
                  <p><strong>Risk Level:</strong> 
                    <Badge className={`ml-2 ${getRiskLevelColor(watchedValues.risk_classification || 'medium')}`}>
                      {watchedValues.risk_classification?.toUpperCase()}
                    </Badge>
                  </p>
                  <p><strong>Status:</strong> {watchedValues.status}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Contact:</strong> {watchedValues.contact_person || 'Not provided'}</p>
                  <p><strong>Email:</strong> {watchedValues.contact_email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {watchedValues.contact_phone || 'Not provided'}</p>
                  <p><strong>Country:</strong> {watchedValues.country || 'Not provided'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Industry:</strong> {watchedValues.industry || 'Not provided'}</p>
                  <p><strong>Employees:</strong> {watchedValues.employee_count || 'Not provided'}</p>
                  <p><strong>Revenue:</strong> {watchedValues.annual_revenue ? `${watchedValues.currency} ${watchedValues.annual_revenue.toLocaleString()}` : 'Not provided'}</p>
                  <p><strong>Founded:</strong> {watchedValues.founded_year || 'Not provided'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Start Date:</strong> {watchedValues.contract_start_date || 'Not provided'}</p>
                  <p><strong>End Date:</strong> {watchedValues.contract_end_date || 'Not provided'}</p>
                  <p><strong>Value:</strong> {watchedValues.contract_value ? `${watchedValues.currency} ${watchedValues.contract_value.toLocaleString()}` : 'Not provided'}</p>
                  <p><strong>Assessment:</strong> Every {watchedValues.assessment_frequency_months} months</p>
                </CardContent>
              </Card>
            </div>

            {/* Arrays Summary */}
            {(watchedValues.certifications?.length || watchedValues.compliance_frameworks?.length || 
              watchedValues.data_processing_activities?.length || watchedValues.critical_services?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Certifications & Services</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {watchedValues.certifications?.length && (
                    <div>
                      <strong>Certifications ({watchedValues.certifications.length}):</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {watchedValues.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {watchedValues.compliance_frameworks?.length && (
                    <div>
                      <strong>Frameworks ({watchedValues.compliance_frameworks.length}):</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {watchedValues.compliance_frameworks.map((framework, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{framework}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {watchedValues.critical_services?.length && (
                    <div>
                      <strong>Critical Services ({watchedValues.critical_services.length}):</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {watchedValues.critical_services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" asChild>
          <Link to="/third-party-risk-management/catalog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Third Party</h1>
          <p className="text-gray-600 mt-2">Add a new third-party vendor or supplier to the catalog</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Steps Progress */}
      <div className="flex justify-between mb-8">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = step >= stepItem.id;
          const isCompleted = step > stepItem.id;

          return (
            <div key={stepItem.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm mt-2 text-center font-medium">
                {stepItem.name}
              </span>
              <span className="text-xs mt-1 text-center text-gray-500">
                {stepItem.description}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {step < 6 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Third Party'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
