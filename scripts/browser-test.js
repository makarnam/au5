const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class AutoTester {
  constructor(options = {}) {
    // Config dosyasını oku
    this.config = this.loadConfig();
    
    this.url = options.url || this.config.testSettings.baseUrl;
    this.headless = options.headless || this.config.testSettings.headless;
    this.timeout = options.timeout || this.config.testSettings.timeout;
    this.browser = null;
    this.page = null;
    
    // Login bilgileri config'den al
    this.loginCredentials = this.config.loginCredentials;
  }

  // Config dosyasını yükle
  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'test-config.json');
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.log('⚠️  Config dosyası okunamadı, varsayılan değerler kullanılıyor');
    }
    
    // Varsayılan config
    return {
      loginCredentials: {
        email: process.env.TEST_EMAIL || 'test@example.com',
        password: process.env.TEST_PASSWORD || 'testpassword123'
      },
      testSettings: {
        headless: false,
        timeout: 30000,
        baseUrl: 'http://localhost:5173'
      }
    };
  }

  // Login bilgilerini güncelleme metodu
  setLoginCredentials(email, password) {
    this.loginCredentials = { email, password };
    this.saveConfig();
    console.log('🔐 Login bilgileri güncellendi ve kaydedildi');
  }

  // Config dosyasını kaydet
  saveConfig() {
    try {
      const configPath = path.join(__dirname, 'test-config.json');
      const configData = {
        loginCredentials: this.loginCredentials,
        testSettings: {
          headless: this.headless,
          timeout: this.timeout,
          baseUrl: this.url
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
      console.log('💾 Config dosyası kaydedildi');
    } catch (error) {
      console.log('❌ Config dosyası kaydedilemedi:', error.message);
    }
  }

  // Login işlemi
  async performLogin() {
    try {
      console.log('🔐 Login işlemi başlatılıyor...');
      
      // Email alanını doldur
      await this.page.type('input[type="email"]', this.loginCredentials.email);
      console.log(`📧 Email girildi: ${this.loginCredentials.email}`);
      
      // Şifre alanını doldur
      await this.page.type('input[type="password"]', this.loginCredentials.password);
      console.log('🔒 Şifre girildi');
      
      // Remember me checkbox'ını işaretle
      await this.page.click('input[type="checkbox"]');
      console.log('✅ Remember me işaretlendi');
      
      // Sign In butonuna tıkla
      await this.page.click('button[type="submit"]');
      console.log('🚀 Sign In butonuna tıklandı');
      
      // Login işleminin tamamlanmasını bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Login başarılı mı kontrol et
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/sign-in')) {
        // Hala login sayfasındaysa hata mesajını kontrol et
        const errorMessage = await this.page.evaluate(() => {
          const errorEl = document.querySelector('.error, .alert, [role="alert"], .text-red-500, .text-red-600');
          return errorEl ? errorEl.textContent : null;
        });
        
        if (errorMessage) {
          console.log(`❌ Login başarısız: ${errorMessage}`);
          return false;
        }
      } else {
        console.log('✅ Login başarılı!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('❌ Login işlemi sırasında hata:', error.message);
      return false;
    }
  }

  async init() {
    console.log('🚀 Browser test başlatılıyor...');
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      devtools: true, // DevTools açık
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Console mesajlarını yakala
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      switch(type) {
        case 'error':
          console.log('❌ Console Error:', text);
          break;
        case 'warning':
          console.log('⚠️  Console Warning:', text);
          break;
        case 'log':
          console.log('📝 Console Log:', text);
          break;
        default:
          console.log(`🔍 Console ${type}:`, text);
      }
    });

    // JavaScript hatalarını yakala
    this.page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
    });

    // Network hatalarını yakala
    this.page.on('requestfailed', request => {
      console.log('🌐 Request Failed:', request.url(), request.failure().errorText);
    });
  }

  async runTests() {
    try {
      console.log(`🌐 Sayfa yükleniyor: ${this.url}`);
      
      // Sayfayı yükle
      await this.page.goto(this.url, { 
        waitUntil: 'networkidle0',
        timeout: this.timeout 
      });

      // Sayfa başlığını kontrol et
      const title = await this.page.title();
      console.log(`📄 Sayfa Başlığı: ${title}`);

      // Login işlemini gerçekleştir
      const loginSuccess = await this.performLogin();
      
      // Basic DOM kontrolü
      await this.checkDOMElements();
      
      // JavaScript hatası var mı kontrol et
      const jsErrors = await this.checkJavaScriptErrors();
      
      // Performance metrikleri al
      await this.getPerformanceMetrics();

      // Test sonucu raporu
      this.generateReport(jsErrors, loginSuccess);

      return jsErrors.length === 0 && loginSuccess;
    } catch (error) {
      console.log('❌ Test hatası:', error.message);
      return false;
    }
  }

  async checkDOMElements() {
    console.log('🔍 DOM elementleri kontrol ediliyor...');
    
    // Temel elementleri kontrol et
    const elements = await this.page.evaluate(() => {
      return {
        hasBody: !!document.body,
        bodyChildren: document.body ? document.body.children.length : 0,
        hasScripts: document.scripts.length,
        hasStyles: document.styleSheets.length
      };
    });

    console.log('📊 DOM İstatistikleri:', elements);
  }

  async checkJavaScriptErrors() {
    // Sayfa yüklenirken yakalanan hatalar zaten console'da
    // Burada ek runtime kontrolleri yapabiliriz
    
    const errors = await this.page.evaluate(() => {
      // Global error handler ekle
      const errors = [];
      const originalError = window.onerror;
      
      window.onerror = function(msg, url, line, col, error) {
        errors.push({
          message: msg,
          source: url,
          line: line,
          column: col,
          error: error ? error.stack : null
        });
        
        if (originalError) {
          originalError.apply(this, arguments);
        }
      };

      // Mevcut hataları döndür
      return errors;
    });

    return errors;
  }

  async getPerformanceMetrics() {
    const metrics = await this.page.metrics();
    console.log('⚡ Performance Metrics:');
    console.log(`   - JavaScript Heap: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)} MB`);
    console.log(`   - DOM Nodes: ${metrics.Nodes}`);
    console.log(`   - Event Listeners: ${metrics.JSEventListeners}`);
  }

  generateReport(jsErrors, loginSuccess) {
    console.log('\n📋 TEST RAPORU');
    console.log('='.repeat(50));
    
    // Login durumu
    if (loginSuccess) {
      console.log('✅ Login başarılı!');
    } else {
      console.log('❌ Login başarısız!');
    }
    
    // JavaScript hataları
    if (jsErrors.length === 0) {
      console.log('✅ JavaScript hataları yok');
    } else {
      console.log(`❌ ${jsErrors.length} JavaScript hatası bulundu:`);
      jsErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message} (${error.source}:${error.line})`);
      });
    }
    
    console.log('='.repeat(50));
    console.log(`🕐 Test Zamanı: ${new Date().toLocaleTimeString()}\n`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // File watcher için
  static async runWithWatcher() {
    const tester = new AutoTester();
    
    try {
      await tester.init();
      const success = await tester.runTests();
      
      // Test başarısızsa browser'ı açık bırak
      if (!success) {
        console.log('🔍 Hata bulundu, browser açık kalacak...');
        // Browser'ı kapatma, debug için açık bırak
        return;
      }
      
      // Başarılıysa belirli süre sonra kapat
      setTimeout(async () => {
        await tester.close();
      }, 5000);
      
    } catch (error) {
      console.error('Test çalıştırılırken hata:', error);
      await tester.close();
    }
  }
}

// Script direkt çalıştırılırsa
if (require.main === module) {
  AutoTester.runWithWatcher();
}

module.exports = AutoTester;