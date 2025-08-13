const { spawn } = require('child_process');
const chokidar = require('chokidar');
const AutoTester = require('./browser-test');
const path = require('path');

class DevWithAutoTest {
  constructor() {
    this.devServer = null;
    this.isRunning = false;
    this.testTimeout = null;
    this.srcPath = path.join(process.cwd(), 'src');
  }

  async start() {
    console.log('🚀 Dev server ve auto-test başlatılıyor...');
    
    // Dev server'ı başlat
    await this.startDevServer();
    
    // File watcher'ı başlat
    this.startFileWatcher();
    
    // İlk test'i çalıştır
    setTimeout(() => {
      this.runTest();
    }, 3000); // Dev server'ın yüklenmesi için bekle
  }

  async startDevServer() {
    return new Promise((resolve) => {
      console.log('📦 Dev server başlatılıyor...');
      
      this.devServer = spawn('npm', ['run', 'dev'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      this.devServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[DEV] ${output.trim()}`);
        
        // Server hazır olduğunda resolve et
        if (output.includes('Local:') || output.includes('ready')) {
          resolve();
        }
      });

      this.devServer.stderr.on('data', (data) => {
        console.log(`[DEV ERROR] ${data.toString().trim()}`);
      });

      this.devServer.on('close', (code) => {
        console.log(`[DEV] Server kapandı. Kod: ${code}`);
      });
    });
  }

  startFileWatcher() {
    console.log('👀 Dosya değişiklikleri izleniyor...');
    
    const watcher = chokidar.watch(this.srcPath, {
      ignored: /(^|[\/\\])\../, // Hidden dosyaları ignore et
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('change', (filePath) => {
        console.log(`📝 Dosya değişti: ${path.relative(process.cwd(), filePath)}`);
        this.scheduleTest();
      })
      .on('add', (filePath) => {
        console.log(`➕ Yeni dosya: ${path.relative(process.cwd(), filePath)}`);
        this.scheduleTest();
      })
      .on('unlink', (filePath) => {
        console.log(`🗑️  Dosya silindi: ${path.relative(process.cwd(), filePath)}`);
        this.scheduleTest();
      });
  }

  scheduleTest() {
    // Çok hızlı değişikliklerde test spam'ını önle
    if (this.testTimeout) {
      clearTimeout(this.testTimeout);
    }

    this.testTimeout = setTimeout(() => {
      this.runTest();
    }, 1000); // 1 saniye bekle
  }

  async runTest() {
    if (this.isRunning) {
      console.log('⏳ Test zaten çalışıyor, atlanıyor...');
      return;
    }

    this.isRunning = true;
    console.log('\n🧪 Otomatik test başlatılıyor...');
    
    try {
      const tester = new AutoTester({
        headless: false, // Browser görünür
        url: 'http://localhost:5173'
      });

      await tester.init();
      await tester.runTests();
      
      // Test sonrası browser'ı kapat
      setTimeout(async () => {
        await tester.close();
      }, 2000);

    } catch (error) {
      console.error('❌ Test hatası:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  async stop() {
    console.log('🛑 Dev server durduruluyor...');
    
    if (this.devServer) {
      this.devServer.kill();
    }
    
    if (this.testTimeout) {
      clearTimeout(this.testTimeout);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Kapatılıyor...');
  process.exit(0);
});

// Script çalıştırılırsa
if (require.main === module) {
  const devTest = new DevWithAutoTest();
  devTest.start();
}

module.exports = DevWithAutoTest;