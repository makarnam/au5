import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Download,
  AlertCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export interface ReportGenerationJob {
  id: string;
  reportId?: string;
  reportName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  startTime: Date;
  estimatedTime?: number;
  error?: string;
  result?: {
    downloadUrl?: string;
    previewUrl?: string;
    fileSize?: number;
  };
}

interface ReportGenerationProgressProps {
  jobs: ReportGenerationJob[];
  onJobComplete?: (job: ReportGenerationJob) => void;
  onJobFailed?: (job: ReportGenerationJob) => void;
  onCancelJob?: (jobId: string) => void;
  maxConcurrentJobs?: number;
}

const ReportGenerationProgress: React.FC<ReportGenerationProgressProps> = ({
  jobs,
  onJobComplete,
  onJobFailed,
  onCancelJob,
  maxConcurrentJobs = 3
}) => {
  const [activeJobs, setActiveJobs] = useState<ReportGenerationJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<ReportGenerationJob[]>([]);

  useEffect(() => {
    // Separate active and completed jobs
    const active = jobs.filter(job =>
      job.status === 'pending' || job.status === 'processing'
    );
    const completed = jobs.filter(job =>
      job.status === 'completed' || job.status === 'failed'
    );

    setActiveJobs(active);
    setCompletedJobs(completed.slice(0, 10)); // Keep only last 10 completed jobs
  }, [jobs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'processing':
        return 'İşleniyor';
      default:
        return 'Bekleniyor';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const calculateElapsedTime = (startTime: Date) => {
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  };

  const calculateRemainingTime = (job: ReportGenerationJob) => {
    if (!job.estimatedTime) return null;
    const elapsed = calculateElapsedTime(job.startTime);
    const remaining = job.estimatedTime - elapsed;
    return Math.max(0, remaining);
  };

  const ActiveJobCard: React.FC<{ job: ReportGenerationJob }> = ({ job }) => {
    const elapsed = calculateElapsedTime(job.startTime);
    const remaining = calculateRemainingTime(job);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon(job.status)}
            <div>
              <h4 className="font-medium text-gray-900">{job.reportName}</h4>
              <p className="text-sm text-gray-600">{job.stage}</p>
            </div>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {getStatusText(job.status)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{job.progress}% tamamlandı</span>
            <span>{formatTime(elapsed)} geçecek</span>
          </div>
          <Progress value={job.progress} className="h-2" />
          {remaining && (
            <div className="text-xs text-gray-500">
              Tahmini kalan süre: {formatTime(remaining)}
            </div>
          )}
        </div>

        {job.status === 'processing' && onCancelJob && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelJob(job.id)}
            >
              İptal Et
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  const CompletedJobCard: React.FC<{ job: ReportGenerationJob }> = ({ job }) => {
    const elapsed = calculateElapsedTime(job.startTime);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon(job.status)}
          <div>
            <div className="font-medium text-sm text-gray-900">{job.reportName}</div>
            <div className="text-xs text-gray-500">
              {formatTime(elapsed)} • {job.stage}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {job.status === 'completed' && job.result?.downloadUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(job.result!.downloadUrl, '_blank')}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {job.status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.error(job.error || 'Rapor oluşturma başarısız')}
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  if (activeJobs.length === 0 && completedJobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Active Jobs */}
      <AnimatePresence>
        {activeJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Rapor Oluşturma İlerlemesi
                  {activeJobs.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeJobs.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {activeJobs.map((job) => (
                    <ActiveJobCard key={job.id} job={job} />
                  ))}
                </div>
                {activeJobs.length >= maxConcurrentJobs && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Maksimum eşzamanlı rapor sayısı ({maxConcurrentJobs}) aşıldı. Diğer raporlar sıraya alındı.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed Jobs */}
      <AnimatePresence>
        {completedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Son Tamamlanan Raporlar
                  <Badge variant="outline" className="ml-2">
                    {completedJobs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {completedJobs.map((job) => (
                    <CompletedJobCard key={job.id} job={job} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing report generation jobs
export const useReportGeneration = () => {
  const [jobs, setJobs] = useState<ReportGenerationJob[]>([]);

  const addJob = (job: Omit<ReportGenerationJob, 'id'>) => {
    const newJob: ReportGenerationJob = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setJobs(prev => [...prev, newJob]);
    return newJob.id;
  };

  const updateJob = (jobId: string, updates: Partial<ReportGenerationJob>) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const clearCompletedJobs = () => {
    setJobs(prev => prev.filter(job => job.status === 'processing' || job.status === 'pending'));
  };

  return {
    jobs,
    addJob,
    updateJob,
    removeJob,
    clearCompletedJobs,
  };
};

export default ReportGenerationProgress;