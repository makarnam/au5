# Risk Control Matrix Module Plan

## Genel Bakış

Bu plan, mevcut AU5 uygulamasına gelişmiş bir Risk Kontrol Matrisi modülü eklemek için kapsamlı bir yol haritası sunar. Modül, sürükle-bırak özellikleri, AI destekli üretim ve mevcut risk ve kontrol sistemleriyle tam entegrasyon içerecektir.

## 1. Mevcut Sistem Analizi

### 1.1 Mevcut Risk Yönetimi
- **Risk Dashboard**: 5x5 risk matrisi, sürükle-bırak desteği
- **Risk Servisleri**: `riskService.ts` - kapsamlı risk CRUD işlemleri
- **Risk Tipleri**: `Risk`, `RiskLevel`, `RiskCategory` tanımları
- **Risk Store**: Zustand tabanlı state yönetimi

### 1.2 Mevcut Kontrol Yönetimi
- **Kontrol Servisleri**: `controlService.ts` - kontrol CRUD işlemleri
- **Kontrol Tipleri**: `Control`, `ControlType`, `ControlEffectiveness`
- **AI Üretimi**: `AIControlGenerator`, `EnhancedAIControlGenerator`
- **Kontrol Setleri**: `ControlSet` yönetimi

### 1.3 Mevcut AI Özellikleri
- **AI Servisleri**: `aiService.ts` - çoklu provider desteği
- **AI Generator**: `AIGenerator.tsx` - çok amaçlı AI üretimi
- **AI Assistant**: `AIAssistant.tsx` - sohbet tabanlı AI

## 2. Risk Kontrol Matrisi Modülü Mimarisi

### 2.1 Veri Modeli

```typescript
// Yeni Tip Tanımları
export interface RiskControlMatrix {
  id: string;
  name: string;
  description: string;
  matrix_type: "5x5" | "4x4" | "3x3" | "custom";
  risk_levels: RiskLevel[];
  control_effectiveness_levels: ControlEffectivenessLevel[];
  business_unit_id: string;
  framework_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MatrixCell {
  id: string;
  matrix_id: string;
  risk_level: RiskLevel;
  control_effectiveness: ControlEffectivenessLevel;
  position_x: number;
  position_y: number;
  color_code: string;
  description: string;
  action_required: string;
  created_at: string;
}

export interface RiskControlMapping {
  id: string;
  matrix_id: string;
  risk_id: string;
  control_id: string;
  mapping_date: string;
  mapped_by: string;
  effectiveness_rating: number; // 1-5
  coverage_rating: number; // 1-5
  notes: string;
  created_at: string;
}

export type ControlEffectivenessLevel = 
  | "excellent" 
  | "good" 
  | "adequate" 
  | "weak" 
  | "inadequate";
```

### 2.2 Veritabanı Şeması

```sql
-- Risk Control Matrix tablosu
CREATE TABLE risk_control_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  matrix_type VARCHAR(20) NOT NULL DEFAULT '5x5',
  risk_levels JSONB NOT NULL,
  control_effectiveness_levels JSONB NOT NULL,
  business_unit_id UUID REFERENCES business_units(id),
  framework_id UUID REFERENCES compliance_frameworks(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matrix hücreleri tablosu
CREATE TABLE matrix_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_id UUID REFERENCES risk_control_matrices(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL,
  control_effectiveness VARCHAR(20) NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  color_code VARCHAR(7) NOT NULL,
  description TEXT,
  action_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(matrix_id, position_x, position_y)
);

-- Risk-Kontrol eşleştirme tablosu
CREATE TABLE risk_control_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_id UUID REFERENCES risk_control_matrices(id) ON DELETE CASCADE,
  risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
  mapping_date DATE NOT NULL,
  mapped_by UUID REFERENCES auth.users(id),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  coverage_rating INTEGER CHECK (coverage_rating >= 1 AND coverage_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(matrix_id, risk_id, control_id)
);

-- Matrix şablonları tablosu
CREATE TABLE matrix_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  matrix_type VARCHAR(20) NOT NULL,
  template_data JSONB NOT NULL,
  industry VARCHAR(100),
  framework VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Bileşen Mimarisi

### 3.1 Ana Bileşenler

```
src/
├── components/
│   └── risk-control-matrix/
│       ├── RiskControlMatrixDashboard.tsx      # Ana dashboard
│       ├── MatrixVisualizer.tsx                # Matris görselleştirici
│       ├── MatrixEditor.tsx                    # Matris düzenleyici
│       ├── DragDropMatrix.tsx                  # Sürükle-bırak matris
│       ├── RiskControlMapper.tsx               # Risk-kontrol eşleştirici
│       ├── MatrixTemplateManager.tsx           # Şablon yöneticisi
│       ├── MatrixAnalytics.tsx                 # Analitik panel
│       ├── AIMatrixGenerator.tsx               # AI matris üreticisi
│       └── MatrixExportImport.tsx              # Dışa/içe aktarma
├── pages/
│   └── risk-control-matrix/
│       ├── RiskControlMatrixPage.tsx           # Ana sayfa
│       ├── CreateMatrixPage.tsx                # Matris oluşturma
│       ├── EditMatrixPage.tsx                  # Matris düzenleme
│       ├── MatrixTemplatesPage.tsx             # Şablonlar
│       └── MatrixAnalyticsPage.tsx             # Analitik
├── services/
│   └── riskControlMatrixService.ts             # Servis katmanı
└── types/
    └── riskControlMatrix.ts                    # Tip tanımları
```

### 3.2 Sürükle-Bırak Özellikleri

```typescript
// DragDropMatrix.tsx - Ana sürükle-bırak bileşeni
interface DragDropMatrixProps {
  matrix: RiskControlMatrix;
  risks: Risk[];
  controls: Control[];
  mappings: RiskControlMapping[];
  onMappingChange: (mapping: RiskControlMapping) => void;
  onRiskDrop: (riskId: string, cellId: string) => void;
  onControlDrop: (controlId: string, cellId: string) => void;
}

// Özellikler:
// - Risk ve kontrolleri matris hücrelerine sürükleme
// - Hücreler arası taşıma
// - Çoklu seçim ve toplu işlemler
// - Klavye navigasyonu desteği
// - Geri alma/ileri alma
// - Otomatik kaydetme
```

## 4. AI Entegrasyonu

### 4.1 AI Matris Üreticisi

```typescript
// AIMatrixGenerator.tsx
interface AIMatrixGenerationConfig {
  industry: string;
  business_size: string;
  risk_categories: RiskCategory[];
  control_frameworks: string[];
  matrix_size: "3x3" | "4x4" | "5x5";
  include_existing_risks: boolean;
  include_existing_controls: boolean;
  generation_focus: "comprehensive" | "focused" | "minimal";
}

// AI Özellikleri:
// - Mevcut risk ve kontrolleri analiz ederek matris oluşturma
// - Endüstri standartlarına göre şablon üretimi
// - Risk-kontrol eşleştirme önerileri
// - Boşluk analizi ve öneriler
// - Matris optimizasyonu
```

### 4.2 AI Prompt Şablonları

```typescript
// Risk Control Matrix AI Prompts
const MATRIX_GENERATION_PROMPTS = {
  matrix_creation: `
    Create a risk-control matrix for {industry} industry with the following specifications:
    - Matrix size: {matrix_size}
    - Risk categories: {risk_categories}
    - Control frameworks: {frameworks}
    - Business size: {business_size}
    
    Generate:
    1. Risk levels and descriptions
    2. Control effectiveness levels
    3. Matrix cell descriptions and action requirements
    4. Color coding scheme
    5. Risk-control mapping recommendations
  `,
  
  gap_analysis: `
    Analyze the current risk-control matrix and identify:
    1. Uncovered risks
    2. Weak control areas
    3. Over-controlled areas
    4. Optimization opportunities
    5. Recommended actions
  `,
  
  mapping_suggestions: `
    Based on the risk "{risk_title}" with level "{risk_level}",
    suggest appropriate controls from the available control set.
    Consider:
    - Control effectiveness
    - Coverage adequacy
    - Cost-benefit analysis
    - Implementation complexity
  `
};
```

## 5. Kullanıcı Arayüzü Tasarımı

### 5.1 Ana Dashboard

```typescript
// RiskControlMatrixDashboard.tsx
const DashboardLayout = {
  header: {
    title: "Risk Control Matrix",
    actions: ["Create Matrix", "Import Template", "AI Generate"]
  },
  sidebar: {
    filters: ["Business Unit", "Framework", "Date Range"],
    quickActions: ["Export", "Share", "Print"]
  },
  main: {
    matrixVisualizer: "Interactive Matrix",
    analytics: "KPIs and Charts",
    mappings: "Risk-Control Mappings"
  },
  bottom: {
    details: "Selected Item Details",
    actions: "Context Actions"
  }
};
```

### 5.2 Sürükle-Bırak Arayüzü

```typescript
// DragDropMatrix.tsx - Gelişmiş özellikler
const DragDropFeatures = {
  visual: {
    grid: "Responsive grid layout",
    cells: "Color-coded matrix cells",
    items: "Risk and control cards",
    indicators: "Drop zone indicators"
  },
  interaction: {
    drag: "Multi-item selection",
    drop: "Smart drop zones",
    hover: "Preview effects",
    feedback: "Visual feedback"
  },
  accessibility: {
    keyboard: "Full keyboard navigation",
    screenReader: "ARIA labels",
    shortcuts: "Keyboard shortcuts"
  }
};
```

## 6. Servis Katmanı

### 6.1 Risk Control Matrix Service

```typescript
// riskControlMatrixService.ts
class RiskControlMatrixService {
  // Matrix CRUD
  async createMatrix(data: CreateMatrixData): Promise<RiskControlMatrix>
  async updateMatrix(id: string, data: UpdateMatrixData): Promise<RiskControlMatrix>
  async deleteMatrix(id: string): Promise<void>
  async getMatrix(id: string): Promise<RiskControlMatrix>
  async getMatrices(filter: MatrixFilter): Promise<RiskControlMatrix[]>
  
  // Cell Management
  async updateCell(id: string, data: UpdateCellData): Promise<MatrixCell>
  async getMatrixCells(matrixId: string): Promise<MatrixCell[]>
  
  // Mapping Management
  async createMapping(data: CreateMappingData): Promise<RiskControlMapping>
  async updateMapping(id: string, data: UpdateMappingData): Promise<RiskControlMapping>
  async deleteMapping(id: string): Promise<void>
  async getMappings(matrixId: string): Promise<RiskControlMapping[]>
  
  // AI Integration
  async generateMatrixWithAI(config: AIMatrixConfig): Promise<RiskControlMatrix>
  async analyzeGaps(matrixId: string): Promise<GapAnalysis>
  async suggestMappings(riskId: string, matrixId: string): Promise<ControlSuggestion[]>
  
  // Templates
  async getTemplates(filter: TemplateFilter): Promise<MatrixTemplate[]>
  async createTemplate(data: CreateTemplateData): Promise<MatrixTemplate>
  async applyTemplate(templateId: string, matrixId: string): Promise<void>
  
  // Analytics
  async getMatrixAnalytics(matrixId: string): Promise<MatrixAnalytics>
  async exportMatrix(matrixId: string, format: ExportFormat): Promise<Blob>
}
```

## 7. Entegrasyon Noktaları

### 7.1 Mevcut Sistemlerle Entegrasyon

```typescript
// Risk Service Entegrasyonu
const riskIntegration = {
  riskService: "Mevcut risk verilerini kullan",
  riskStore: "Zustand store ile senkronizasyon",
  riskDashboard: "Risk dashboard ile bağlantı"
};

// Control Service Entegrasyonu
const controlIntegration = {
  controlService: "Mevcut kontrol verilerini kullan",
  controlSets: "Kontrol setleri ile entegrasyon",
  controlTesting: "Test sonuçları ile bağlantı"
};

// AI Service Entegrasyonu
const aiIntegration = {
  aiService: "Mevcut AI servislerini kullan",
  aiGenerator: "AI üretim özelliklerini genişlet",
  aiAssistant: "AI asistan ile entegrasyon"
};
```

### 7.2 Workflow Entegrasyonu

```typescript
// Workflow Integration
const workflowIntegration = {
  approval: "Matris değişiklikleri için onay süreci",
  notifications: "Değişiklik bildirimleri",
  audit: "Değişiklik geçmişi ve audit trail"
};
```

## 8. Geliştirme Aşamaları

### 8.1 Faz 1: Temel Altyapı (2-3 hafta)
- [x] Veritabanı şeması oluşturma
- [x] Temel tip tanımları
- [x] Servis katmanı geliştirme
- [x] Basit matris görselleştirici

### 8.2 Faz 2: Sürükle-Bırak (3-4 hafta)
- [x] DragDropMatrix bileşeni
- [x] Risk-kontrol eşleştirme
- [x] Görsel geri bildirimler
- [x] Klavye navigasyonu

### 8.3 Faz 3: AI Entegrasyonu (2-3 hafta)
- [x] AIMatrixGenerator bileşeni
- [x] AI prompt şablonları
- [x] Mevcut AI servisleri ile entegrasyon
- [x] Şablon yönetimi

### 8.4 Faz 4: Gelişmiş Özellikler (2-3 hafta)
- [x] Analitik dashboard
- [x] Dışa/içe aktarma
- [ ] Şablon kütüphanesi
- [ ] Performans optimizasyonu

### 8.5 Faz 5: Test ve Optimizasyon (1-2 hafta)
- [ ] Kapsamlı testler
- [ ] Performans optimizasyonu
- [ ] Kullanıcı geri bildirimleri
- [ ] Dokümantasyon

## 9. Teknik Gereksinimler

### 9.1 Bağımlılıklar
```json
{
  "react-beautiful-dnd": "^13.1.1", // Sürükle-bırak
  "framer-motion": "^10.18.0", // Animasyonlar
  "recharts": "^2.9.3", // Grafikler
  "@radix-ui/react-tooltip": "^1.0.7", // Tooltip'ler
  "react-hot-toast": "^2.4.1" // Bildirimler
}
```

### 9.2 Performans Gereksinimleri
- Matris render: < 100ms
- Sürükle-bırak gecikme: < 16ms
- AI yanıt süresi: < 5 saniye
- Sayfa yükleme: < 2 saniye

### 9.3 Güvenlik Gereksinimleri
- RBAC (Role-Based Access Control)
- Audit trail
- Veri şifreleme
- API rate limiting

## 10. Test Stratejisi

### 10.1 Birim Testler
```typescript
// __tests__/components/risk-control-matrix/
├── DragDropMatrix.test.tsx
├── MatrixVisualizer.test.tsx
├── AIMatrixGenerator.test.tsx
└── MatrixAnalytics.test.tsx
```

### 10.2 Entegrasyon Testleri
```typescript
// __tests__/services/
└── riskControlMatrixService.test.ts
```

### 10.3 E2E Testleri
```typescript
// __tests__/e2e/
└── risk-control-matrix.e2e.test.ts
```

## 11. Dokümantasyon

### 11.1 Kullanıcı Kılavuzu
- Matris oluşturma ve düzenleme
- Sürükle-bırak kullanımı
- AI özellikleri
- Analitik ve raporlama

### 11.2 Geliştirici Dokümantasyonu
- API referansı
- Bileşen dokümantasyonu
- Entegrasyon kılavuzu
- Örnek kodlar

## 12. Deployment ve Monitoring

### 12.1 Deployment
- Staging ortamı testleri
- Production deployment
- Rollback stratejisi

### 12.2 Monitoring
- Performans metrikleri
- Hata izleme
- Kullanıcı davranış analizi
- AI model performansı

## 13. Gelecek Geliştirmeler

### 13.1 Kısa Vadeli (3-6 ay)
- Mobil uygulama desteği
- Gelişmiş analitik
- Otomatik güncelleme
- Çoklu dil desteği

### 13.2 Uzun Vadeli (6-12 ay)
- Machine Learning entegrasyonu
- Predictive analytics
- Blockchain audit trail
- API marketplace

## 14. Risk Yönetimi

### 14.1 Teknik Riskler
- Performans sorunları
- AI model güvenilirliği
- Veri tutarlılığı
- Ölçeklenebilirlik

### 14.2 Proje Riskleri
- Zaman aşımı
- Kaynak kısıtlamaları
- Gereksinim değişiklikleri
- Kullanıcı kabulü

## 15. Geliştirme Durumu

### 15.1 Tamamlanan Görevler ✅

**Faz 1: Temel Altyapı (Tamamlandı)**
- ✅ Veritabanı şeması oluşturma
  - `risk_control_matrices` tablosu
  - `matrix_cells` tablosu
  - `risk_control_mappings` tablosu
  - `matrix_templates` tablosu
- ✅ Temel tip tanımları (`src/types/riskControlMatrix.ts`)
  - RiskControlMatrix, MatrixCell, RiskControlMapping, MatrixTemplate
  - Service types, AI integration types, Analytics types
- ✅ Servis katmanı geliştirme (`src/services/riskControlMatrixService.ts`)
  - Matrix CRUD operations
  - Cell management
  - Mapping management
  - AI integration
  - Template management
  - Analytics and export functionality
- ✅ Ana dashboard bileşeni (`src/components/risk-control-matrix/RiskControlMatrixDashboard.tsx`)
  - Matrix listesi ve filtreleme
  - Analytics gösterimi
  - Export fonksiyonları
  - Responsive tasarım
- ✅ DragDropMatrix bileşeni (`src/components/risk-control-matrix/DragDropMatrix.tsx`)
  - Sürükle-bırak matris görselleştirici
  - Risk ve kontrol eşleştirme
  - Görsel geri bildirimler ve tooltip'ler
  - Hücre seçimi ve detay gösterimi

### 15.2 Devam Eden Görevler 🔄

**Faz 2: Sürükle-Bırak (Kısmen Tamamlandı)**
- [x] DragDropMatrix bileşeni
- [x] Risk-kontrol eşleştirme
- [x] Görsel geri bildirimler
- [ ] Klavye navigasyonu

**Faz 3: AI Entegrasyonu (Tamamlandı)**
- [x] AIMatrixGenerator bileşeni
- [x] AI prompt şablonları
- [x] Mevcut AI servisleri ile entegrasyon
- [x] Şablon yönetimi

### 15.3 Yeni Tamamlanan Görevler ✅

**Faz 3: AI Entegrasyonu (Tamamlandı)**
- ✅ AIMatrixGenerator bileşeni (`src/components/risk-control-matrix/AIMatrixGenerator.tsx`)
  - Kapsamlı AI matris üretim arayüzü
  - Endüstri, işletme büyüklüğü, risk kategorileri ve kontrol çerçeveleri seçimi
  - Mevcut risk ve kontrolleri dahil etme seçeneği
  - Gelişmiş seçenekler ve özel prompt desteği
  - JSON formatında yapılandırılmış AI yanıtı
- ✅ AI prompt şablonları (`src/services/aiService.ts`)
  - "risk_control_matrix" field type eklendi
  - Kapsamlı prompt şablonu oluşturuldu
  - JSON formatında yapılandırılmış yanıt desteği
- ✅ Mevcut AI servisleri ile entegrasyon
  - aiService ile tam entegrasyon
  - Çoklu AI provider desteği (OpenAI, Claude, Gemini, Ollama)
  - Hata yönetimi ve kullanıcı geri bildirimi
- ✅ Şablon yönetimi (`src/components/risk-control-matrix/MatrixTemplateManager.tsx`)
  - Kapsamlı şablon CRUD işlemleri
  - Şablon filtreleme ve arama
  - Şablon uygulama ve çoğaltma
  - Endüstri ve çerçeve bazlı şablon organizasyonu
- ✅ Ana dashboard entegrasyonu (`src/components/risk-control-matrix/RiskControlMatrixDashboard.tsx`)
  - Tab tabanlı arayüz (Matrices, AI Generator, Templates)
  - AI üretilen matrislerin otomatik kaydedilmesi
  - Şablon uygulama entegrasyonu
  - Seamless kullanıcı deneyimi
- ✅ Servis katmanı genişletmeleri (`src/services/riskControlMatrixService.ts`)
  - Template CRUD metodları eklendi
  - Şablon uygulama fonksiyonalitesi
  - AI entegrasyonu için gerekli metodlar

**Faz 4: Gelişmiş Özellikler (Kısmen Tamamlandı)**
- ✅ MatrixAnalytics bileşeni (`src/components/risk-control-matrix/MatrixAnalytics.tsx`)
  - Kapsamlı analitik dashboard bileşeni
  - Recharts kullanarak çoklu grafik türleri (Pie, Bar, Line, Area, Radar, Scatter, Funnel)
  - Üç görünüm modu: Overview, Detailed Analysis, Trends
  - KPI kartları ve performans metrikleri
  - Risk dağılımı ve kontrol etkinliği analizleri
  - Zaman serisi grafikleri ve trend analizleri
  - Matrix heatmap görselleştirmesi
  - Gap analizi ve risk maruziyeti değerlendirmesi
  - Çoklu format export (PDF, Excel, CSV)
  - Responsive tasarım ve kullanıcı dostu arayüz
- ✅ MatrixExportImport bileşeni (`src/components/risk-control-matrix/MatrixExportImport.tsx`)
  - Kapsamlı export/import fonksiyonalitesi
  - Çoklu format desteği (Excel, PDF, CSV, JSON)
  - Drag & drop dosya yükleme
  - Import önizleme ve validasyon
  - Gelişmiş export seçenekleri (analytics, metadata, templates, history)
  - Hata yönetimi ve kullanıcı geri bildirimi
  - Dosya formatı otomatik algılama
  - Clipboard kopyalama ve yardım bölümü

## 16. Sonuç

Bu plan, AU5 uygulamasına güçlü bir Risk Kontrol Matrisi modülü eklemek için kapsamlı bir yol haritası sunar. Modül, mevcut sistemlerle tam entegrasyon, gelişmiş AI özellikleri ve kullanıcı dostu sürükle-bırak arayüzü ile modern bir risk yönetimi deneyimi sağlayacaktır.

### 15.1 Başarı Kriterleri
- Kullanıcı memnuniyeti > %85
- Performans hedeflerine ulaşma
- AI doğruluğu > %90
- Test coverage > %80

### 15.2 ROI Beklentileri
- Risk yönetimi verimliliği artışı: %40
- Manuel iş yükü azalması: %60
- Hata oranı azalması: %50
- Uyumluluk süresi kısalması: %30
```

Bu plan, mevcut AU5 uygulamasının güçlü altyapısını kullanarak, modern ve kullanıcı dostu bir Risk Kontrol Matrisi modülü geliştirmek için kapsamlı bir yol haritası sunar. Plan, sürükle-bırak özellikleri, AI entegrasyonu ve mevcut sistemlerle tam uyumluluk konularına odaklanır.
