import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { FileText, Download, Eye, Calendar, User, Sparkles, RefreshCw, X, Plus, Search, Filter, MoreVertical, CheckSquare, Square, Trash2, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { ReportPreview } from "../../components/ReportPreview";
import { reportExportService } from "../../services/reportExportService";

interface Report {
  id: string;
  name: string;
  description: string;
  status: string;
  generation_method: string;
  ai_generated: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

const GeneratedReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkOperation, setIsBulkOperation] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('report_instances')
        .select(`
          id,
          name,
          description,
          status,
          generation_method,
          ai_generated,
          tags,
          created_at,
          updated_at,
          created_by,
          users!created_by (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportsData = data || [];
      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      setError(error instanceof Error ? error.message : 'Raporlar yüklenirken hata oluştu');
      toast.error('Raporlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search functionality
  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let dateThreshold: Date;

      switch (dateFilter) {
        case "today":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          dateThreshold = new Date(0);
      }

      filtered = filtered.filter(report =>
        new Date(report.created_at) >= dateThreshold
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  };

  // Apply filters when search/filter criteria change
  useEffect(() => {
    applyFilters();
  }, [reports, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const viewReport = async (report: Report) => {
    setIsViewing(true);
    try {
      const { data, error } = await supabase
        .from('report_instances')
        .select('content')
        .eq('id', report.id)
        .single();

      if (error) throw error;

      // Merge the content with the report data
      const reportWithContent = {
        ...report,
        content: data.content
      };

      setPreviewReport(reportWithContent);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading report content:', error);
      toast.error('Rapor içeriği yüklenirken hata oluştu');
    } finally {
      setIsViewing(false);
    }
  };

  const downloadReport = async (report: Report, format: 'pdf' | 'excel' | 'word' | 'html' = 'pdf') => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Get the full report content
      const { data: reportData, error } = await supabase
        .from('report_instances')
        .select('*')
        .eq('id', report.id)
        .single();

      if (error) throw error;

      const exportData = {
        title: reportData.name,
        description: reportData.description,
        sections: reportData.content?.sections || [],
        metadata: {
          generatedAt: new Date().toLocaleString('tr-TR'),
          generatedBy: user.first_name + ' ' + user.last_name,
          version: '1.0',
          reportId: report.id,
          status: reportData.status,
          generationMethod: reportData.generation_method,
          aiGenerated: reportData.ai_generated
        }
      };

      const exportOptions = {
        format,
        title: reportData.name,
        includeCharts: true,
        includeImages: true,
        pageOrientation: 'portrait' as const,
        fontSize: 12,
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      };

      const blob = await reportExportService.exportReport(exportData, exportOptions);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportData.name}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Rapor ${format.toUpperCase()} olarak indirildi!`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(`Rapor indirilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const navigateToReportCreation = () => {
    // Navigate to report wizard for structured report creation
    window.location.href = '/reports/wizard';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  // Bulk operations
  const toggleReportSelection = (reportId: string) => {
    const newSelection = new Set(selectedReports);
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId);
    } else {
      newSelection.add(reportId);
    }
    setSelectedReports(newSelection);
  };

  const toggleAllReports = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const clearSelection = () => {
    setSelectedReports(new Set());
    setIsBulkMode(false);
  };

  const bulkDeleteReports = async () => {
    if (selectedReports.size === 0) return;

    const confirmMessage = `${selectedReports.size} rapor silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;
    if (!confirm(confirmMessage)) return;

    setIsBulkOperation(true);
    try {
      const { error } = await supabase
        .from('report_instances')
        .delete()
        .in('id', Array.from(selectedReports));

      if (error) throw error;

      toast.success(`${selectedReports.size} rapor başarıyla silindi`);
      setSelectedReports(new Set());
      setIsBulkMode(false);
      await loadReports();
    } catch (error) {
      console.error('Error deleting reports:', error);
      toast.error('Raporlar silinirken hata oluştu');
    } finally {
      setIsBulkOperation(false);
    }
  };

  const bulkExportReports = async (format: 'pdf' | 'excel' | 'word' | 'html') => {
    if (selectedReports.size === 0) return;

    setIsBulkOperation(true);
    try {
      const selectedReportData = filteredReports.filter(r => selectedReports.has(r.id));

      for (const report of selectedReportData) {
        await downloadReport(report, format);
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`${selectedReports.size} rapor ${format.toUpperCase()} olarak indirildi`);
    } catch (error) {
      console.error('Error bulk exporting reports:', error);
      toast.error('Toplu dışa aktarma sırasında hata oluştu');
    } finally {
      setIsBulkOperation(false);
    }
  };

  const bulkArchiveReports = async () => {
    if (selectedReports.size === 0) return;

    setIsBulkOperation(true);
    try {
      const { error } = await supabase
        .from('report_instances')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedReports));

      if (error) throw error;

      toast.success(`${selectedReports.size} rapor arşivlendi`);
      setSelectedReports(new Set());
      setIsBulkMode(false);
      await loadReports();
    } catch (error) {
      console.error('Error archiving reports:', error);
      toast.error('Raporlar arşivlenirken hata oluştu');
    } finally {
      setIsBulkOperation(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getUserDisplayName = (report: Report) => {
    if (report.user) {
      return `${report.user.first_name} ${report.user.last_name}`;
    }
    return 'Bilinmeyen Kullanıcı';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Oluşturulan Raporlar</h1>
          <p className="text-gray-600 mt-2">
            Tüm oluşturulan raporlarınızı görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadReports} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={navigateToReportCreation}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Rapor Oluştur
          </Button>
          <Button
            variant={isBulkMode ? "default" : "outline"}
            onClick={() => setIsBulkMode(!isBulkMode)}
            disabled={filteredReports.length === 0}
          >
            {isBulkMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Çık
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Toplu İşlemler
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bulk Operations Bar */}
      {isBulkMode && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleAllReports}
                    className="flex items-center space-x-2 text-blue-700 hover:text-blue-900"
                  >
                    {selectedReports.size === filteredReports.length ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {selectedReports.size === filteredReports.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                    </span>
                  </button>
                </div>
                <div className="text-sm text-blue-700">
                  {selectedReports.size} rapor seçildi ({filteredReports.length} toplam)
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkExportReports('pdf')}
                  disabled={selectedReports.size === 0 || isBulkOperation}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF Dışa Aktar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkExportReports('excel')}
                  disabled={selectedReports.size === 0 || isBulkOperation}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel Dışa Aktar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkArchiveReports}
                  disabled={selectedReports.size === 0 || isBulkOperation}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Arşivle
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={bulkDeleteReports}
                  disabled={selectedReports.size === 0 || isBulkOperation}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Sil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rapor ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="processing">İşleniyor</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tarih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tarihler</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Tarih</SelectItem>
                  <SelectItem value="name">İsim</SelectItem>
                  <SelectItem value="status">Durum</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Rapor Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Raporlar yükleniyor...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              {reports.length === 0 ? (
                <>
                  <p className="text-gray-600">Henüz hiç rapor oluşturulmamış.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Rapor sihirbazı ile ilk raporunuzu oluşturabilirsiniz.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">Filtre kriterlerinize uygun rapor bulunamadı.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Filtreleri temizleyerek tüm raporları görüntüleyebilirsiniz.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Filtreleri Temizle
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                    selectedReports.has(report.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {isBulkMode && (
                    <div className="flex items-center mr-3">
                      <button
                        onClick={() => toggleReportSelection(report.id)}
                        className="flex items-center justify-center w-5 h-5 border-2 rounded hover:bg-blue-100"
                      >
                        {selectedReports.has(report.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'draft' ? 'Taslak' :
                         report.status === 'completed' ? 'Tamamlandı' :
                         report.status === 'processing' ? 'İşleniyor' :
                         report.status === 'failed' ? 'Başarısız' : report.status}
                      </Badge>
                      {report.ai_generated && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Oluşturuldu
                        </Badge>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {getUserDisplayName(report)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(report.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {report.generation_method === 'wizard' ? 'Sihirbaz' : report.generation_method}
                      </span>
                    </div>
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {report.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {report.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{report.tags.length - 3} daha fazla
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewReport(report)}
                      disabled={isViewing}
                    >
                      {isViewing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Görüntüle
                        </>
                      )}
                    </Button>
                    {report.status === 'completed' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isExporting}>
                            {isExporting ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                İndiriliyor...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-1" />
                                İndir
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadReport(report, 'pdf')}>
                            PDF olarak indir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadReport(report, 'excel')}>
                            Excel olarak indir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadReport(report, 'word')}>
                            Word olarak indir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadReport(report, 'html')}>
                            HTML olarak indir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Rapor Önizlemesi: {previewReport?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[75vh]">
            {previewReport && (
              <ReportPreview
                title={previewReport.name}
                description={previewReport.description}
                sections={(previewReport as any).content?.sections || []}
                entityType={(previewReport as any).content?.entity_type || 'general'}
                entityId={(previewReport as any).content?.entity_id}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratedReportsPage;