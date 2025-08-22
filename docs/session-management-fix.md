# Session Yönetimi Düzeltmeleri

## Sorun
Uygulama hata aldığında işlem yapamama sorunu yaşanıyordu. İlk çalışmayan fonksiyona tıklayınca muhtemelen Supabase kaynaklı session problemi oluyor ve sonra veri tabanına okuma veya yazma yapamıyordu.

## Çözüm
Session yönetimi ve hata yakalama mekanizmalarını iyileştirdik:

### 1. Session Interceptor (`src/lib/sessionInterceptor.ts`)
- API çağrılarını otomatik olarak intercept eder
- Session expire olduğunda otomatik yenileme yapar
- Hata durumunda kullanıcıyı bilgilendirir
- Session yenilendikten sonra orijinal isteği tekrar dener

### 2. Error Handler (`src/lib/errorHandler.ts`)
- Global hata yakalama mekanizması
- Session hatalarını otomatik tespit eder
- Session yenileme ve retry mantığı
- Kullanıcı dostu hata mesajları

### 3. AuthStore İyileştirmeleri (`src/store/authStore.ts`)
- Session yenileme fonksiyonu eklendi
- Hata yakalama fonksiyonu eklendi
- TOKEN_REFRESHED event'i handle ediliyor
- Daha iyi session durumu takibi

### 4. Supabase Client İyileştirmeleri (`src/lib/supabase.ts`)
- Özel storage key kullanımı
- Hata yakalama ile storage işlemleri
- Daha iyi session persistence

## Kullanım

### Service Dosyalarında Hata Yakalama
```typescript
import { withErrorHandling, handleSupabaseError } from '../lib/errorHandler';

// Fonksiyonu wrap et
async getRisks(): Promise<Risk[]> {
  return withErrorHandling(async () => {
    const { data, error } = await supabase.from('risks').select('*');
    if (error) throw error;
    return data;
  }, 'Get risks') ?? [];
}

// Veya manuel hata yakalama
async createRisk(payload: Risk): Promise<void> {
  try {
    const { error } = await supabase.from('risks').insert(payload);
    if (error) throw error;
  } catch (error) {
    await handleSupabaseError(error, 'Create risk');
  }
}
```

### Debug Araçları
Console'da session durumunu kontrol etmek için:

```javascript
// Session durumunu debug et
sessionDebug.debug()

// Session'ı zorla yenile
sessionDebug.refresh()

// Session verilerini temizle
sessionDebug.clear()

// Database operasyonlarını test et
sessionDebug.test()
```

## Özellikler

### Otomatik Session Yenileme
- Session expire olduğunda otomatik yenileme
- Yenileme başarısız olursa login sayfasına yönlendirme
- Kullanıcıya bilgilendirici mesajlar

### Retry Mekanizması
- Session hatası sonrası otomatik retry
- Maksimum retry sayısı kontrolü
- Retry arası bekleme süresi

### Global Hata Yakalama
- Unhandled promise rejection yakalama
- Global error event yakalama
- Session hatalarını otomatik tespit

### Debug Araçları
- Session durumu kontrolü
- Database bağlantı testi
- Storage durumu kontrolü
- Öneriler ve çözümler

## Test Etme

1. Uygulamayı açın
2. Console'u açın (F12)
3. `sessionDebug.debug()` komutunu çalıştırın
4. Session durumunu kontrol edin
5. Gerekirse `sessionDebug.refresh()` ile session'ı yenileyin

## Sorun Giderme

### Session Expire Olduğunda
1. Otomatik yenileme denenir
2. Başarısız olursa kullanıcı login sayfasına yönlendirilir
3. Console'da `sessionDebug.debug()` ile durumu kontrol edin

### Database Bağlantı Sorunları
1. `sessionDebug.test()` ile database operasyonlarını test edin
2. Network bağlantısını kontrol edin
3. Supabase projesinin aktif olduğundan emin olun

### Storage Sorunları
1. Browser'ın localStorage'ı desteklediğinden emin olun
2. Private/incognito modda test edin
3. Browser cache'ini temizleyin

## Gelecek İyileştirmeler

- [ ] Session timeout uyarıları
- [ ] Offline/online durumu kontrolü
- [ ] Daha detaylı hata logları
- [ ] Performance monitoring
- [ ] Session analytics
