# Session Recovery ve Hata Kurtarma Özellikleri

Bu dokümantasyon, uygulamanın yeni tab'da açıldığında veya hata aldığında devam etmesini sağlayan özellikleri açıklar.

## 🎯 Özellikler

### 1. Otomatik Session Kurtarma
- **Yeni Tab'da Açılma**: Uygulama yeni tab'da açıldığında otomatik olarak session durumunu kontrol eder
- **Hata Durumlarında Kurtarma**: Session hatalarında otomatik kurtarma mekanizması
- **Network Bağlantısı**: İnternet bağlantısı kesilip geri geldiğinde otomatik kurtarma

### 2. Gelişmiş Hata İşleme
- **Global Hata Yakalama**: Tüm hataları yakalar ve uygun şekilde işler
- **Otomatik Retry**: Session hatalarında otomatik yeniden deneme
- **Kullanıcı Dostu Mesajlar**: Anlaşılır hata mesajları

### 3. Session Monitoring
- **Sürekli İzleme**: Session durumunu sürekli kontrol eder
- **Proaktif Yenileme**: Session süresi dolmadan önce otomatik yenileme
- **Health Check**: Session sağlığını düzenli kontrol

## 🔧 Teknik Detaylar

### AuthStore Geliştirmeleri

```typescript
interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
  lastActivity: number;           // Son aktivite zamanı
  sessionRecoveryAttempts: number; // Kurtarma deneme sayısı
  isRecovering: boolean;          // Kurtarma durumu
}
```

### Yeni Metodlar

- `refreshSession()`: Session'ı yeniler
- `recoverSession()`: Session'ı kurtarır
- `updateLastActivity()`: Son aktivite zamanını günceller
- `resetRecoveryAttempts()`: Kurtarma denemelerini sıfırlar

### ErrorHandler Geliştirmeleri

```typescript
interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  retryOnSessionError?: boolean;
  autoRecover?: boolean;         // Otomatik kurtarma
  maxRetries?: number;           // Maksimum deneme sayısı
}
```

## 🚀 Kullanım

### 1. Otomatik Session Monitoring

```typescript
// App.tsx'te otomatik başlatılır
useEffect(() => {
  // Session monitoring başlat
  startSessionMonitoring(30000); // 30 saniyede bir kontrol
  
  // Otomatik kurtarma
  autoRecoverSession();
}, []);
```

### 2. Manuel Session Kurtarma

```typescript
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore.getState();
const success = await authStore.recoverSession();
```

### 3. Session Recovery Hook

```typescript
import useSessionRecovery from '../lib/sessionRecovery';

const { isRecovering, attemptRecovery } = useSessionRecovery({
  autoRecover: true,
  showNotifications: true,
  checkInterval: 60000
});
```

## 🔍 Debug ve Test

### Console Komutları

```javascript
// Session durumunu kontrol et
sessionDebug.debug()

// Session'ı zorla yenile
sessionDebug.refresh()

// Session monitoring başlat
sessionDebug.monitor()

// Otomatik kurtarma
sessionDebug.autoRecover()

// Session sağlığını kontrol et
sessionDebug.health()
```

### Test Komutları

```javascript
// Tüm session recovery testlerini çalıştır
sessionRecoveryTests.runAll()

// Manuel kurtarma testi
sessionRecoveryTests.manual()

// Network kurtarma testi
sessionRecoveryTests.network()

// Tab visibility testi
sessionRecoveryTests.visibility()
```

## 📊 Monitoring Özellikleri

### 1. Activity Tracking
- Mouse hareketleri
- Klavye girişleri
- Scroll olayları
- Touch olayları

### 2. Visibility Change Handling
- Tab değişikliklerini algılar
- Sayfa görünür olduğunda session kontrolü
- Otomatik kurtarma

### 3. Network Status Monitoring
- Online/offline durumu
- Bağlantı geri geldiğinde otomatik kurtarma
- Kullanıcıya bilgi verme

## 🛡️ Güvenlik

### Session Timeout
- 24 saat sonra otomatik session temizleme
- Aktivite takibi ile session süresini uzatma
- Güvenli session yenileme

### Recovery Limits
- Maksimum 3 kurtarma denemesi
- Başarısız denemelerden sonra login'e yönlendirme
- Rate limiting

## 🔧 Konfigürasyon

### Environment Variables

```typescript
// Session timeout (milisaniye)
SESSION_TIMEOUT = 24 * 60 * 60 * 1000

// Monitoring interval (milisaniye)
MONITORING_INTERVAL = 30000

// Max recovery attempts
MAX_RECOVERY_ATTEMPTS = 3
```

### Customization

```typescript
// ErrorHandler konfigürasyonu
const config: ErrorHandlerConfig = {
  autoRecover: true,
  maxRetries: 3,
  showToast: true,
  logError: true
};

// Session recovery hook konfigürasyonu
const recoveryOptions = {
  autoRecover: true,
  showNotifications: true,
  checkInterval: 60000
};
```

## 📈 Performans

### Optimizasyonlar
- Lazy loading ile session kontrolü
- Debounced activity tracking
- Efficient event listeners
- Memory leak prevention

### Monitoring
- Session health metrics
- Recovery success rate
- Error tracking
- Performance monitoring

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Session sürekli kayboluyor**
   - Network bağlantısını kontrol edin
   - Browser storage'ı temizleyin
   - Console'da hata mesajlarını kontrol edin

2. **Otomatik kurtarma çalışmıyor**
   - `sessionDebug.debug()` ile durumu kontrol edin
   - `sessionRecoveryTests.runAll()` ile test edin
   - Network bağlantısını kontrol edin

3. **Performance sorunları**
   - Monitoring interval'ını artırın
   - Activity tracking'i devre dışı bırakın
   - Browser developer tools'da performance'ı kontrol edin

### Debug Adımları

1. Console'u açın
2. `sessionDebug.debug()` çalıştırın
3. Hata mesajlarını kontrol edin
4. `sessionRecoveryTests.runAll()` ile test edin
5. Network tab'ında istekleri kontrol edin

## 🔄 Güncellemeler

### v1.0.0
- Temel session recovery özellikleri
- Otomatik kurtarma
- Activity tracking

### v1.1.0
- Gelişmiş hata işleme
- Network monitoring
- Tab visibility handling

### v1.2.0
- Session health monitoring
- Proaktif session yenileme
- Performance optimizasyonları

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console'da debug bilgilerini kontrol edin
2. Test komutlarını çalıştırın
3. Network bağlantısını kontrol edin
4. Browser storage'ı temizleyin
5. Gerekirse tekrar login olun
