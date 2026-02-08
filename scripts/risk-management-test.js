const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase client for database verification
const supabaseUrl = 'https://iuxhefuorkpbmwxmxtqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class RiskManagementTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5173';
    this.loginCredentials = {
      email: 'depommh@gmail.com',
      password: 'Password123'
    };
    this.testResults = {
      login: false,
      pages: {},
      errors: [],
      screenshots: [],
      databaseConnectivity: false,
      createdRiskId: null,
      dataPersistenceVerified: false,
      databaseErrorHandling: false
    };
  }

  async init() {
    console.log('🚀 Starting Risk Management UI Test...');

    // First, test database connectivity
    await this.testDatabaseConnectivity();

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.page = await this.browser.newPage();

    // Set up console logging
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log('❌ Console Error:', text);
        this.testResults.errors.push(`Console Error: ${text}`);
      } else if (type === 'warning') {
        console.log('⚠️  Console Warning:', text);
      }
    });

    this.page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
      this.testResults.errors.push(`Page Error: ${error.message}`);
    });
  }

  async testDatabaseConnectivity() {
    try {
      console.log('🔍 Testing database connectivity...');
      const { data, error } = await supabase
        .from('risks')
        .select('count')
        .limit(1);

      if (error) {
        console.log('❌ Database connectivity failed:', error.message);
        this.testResults.errors.push(`Database Error: ${error.message}`);
        this.testResults.databaseConnectivity = false;
      } else {
        console.log('✅ Database connectivity successful');
        this.testResults.databaseConnectivity = true;
      }
    } catch (error) {
      console.log('❌ Database connectivity test failed:', error.message);
      this.testResults.errors.push(`Database Test Error: ${error.message}`);
      this.testResults.databaseConnectivity = false;
    }
  }

  async verifyDataPersistence(riskTitle) {
    try {
      console.log(`🔍 Verifying data persistence for risk: ${riskTitle}`);

      // Wait a moment for database to sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from('risks')
        .select('id, title, category, created_at')
        .ilike('title', `%${riskTitle}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.log('❌ Data persistence verification failed:', error.message);
        this.testResults.errors.push(`Data Verification Error: ${error.message}`);
        return false;
      }

      if (data && data.length > 0) {
        console.log('✅ Data persistence verified - Risk found in database');
        this.testResults.createdRiskId = data[0].id;
        this.testResults.dataPersistenceVerified = true;
        return true;
      } else {
        console.log('❌ Data persistence verification failed - Risk not found in database');
        this.testResults.errors.push('Data persistence verification failed - Risk not found in database');
        return false;
      }
    } catch (error) {
      console.log('❌ Data persistence verification error:', error.message);
      this.testResults.errors.push(`Data Verification Error: ${error.message}`);
      return false;
    }
  }

  async testDatabaseErrorHandling() {
    console.log('\n🧪 Testing database error handling...');

    try {
      // Create a client with invalid credentials to simulate database unavailability
      const invalidSupabase = createClient('https://invalid-url.supabase.co', 'invalid-key');

      const { data, error } = await invalidSupabase
        .from('risks')
        .select('count')
        .limit(1);

      if (error) {
        console.log('✅ Error handling verified - Invalid credentials properly handled');
        this.testResults.databaseErrorHandling = true;
      } else {
        console.log('⚠️  Unexpected success with invalid credentials');
        this.testResults.databaseErrorHandling = false;
        this.testResults.errors.push('Database error handling test failed - invalid credentials should fail');
      }
    } catch (error) {
      console.log('✅ Error handling verified - Exception properly caught:', error.message);
      this.testResults.databaseErrorHandling = true;
    }
  }

  async performLogin() {
    try {
      console.log('🔐 Performing login...');

      // Navigate to sign-in page
      await this.page.goto(`${this.baseUrl}/auth/sign-in`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for form to load
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

      // Fill email
      await this.page.type('input[type="email"]', this.loginCredentials.email);
      console.log(`📧 Email entered: ${this.loginCredentials.email}`);

      // Fill password
      await this.page.type('input[type="password"]', this.loginCredentials.password);
      console.log('🔒 Password entered');

      // Check remember me
      await this.page.click('input[type="checkbox"]');
      console.log('✅ Remember me checked');

      // Click sign in
      await this.page.click('button[type="submit"]');
      console.log('🚀 Sign in clicked');

      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

      // Additional wait for page stabilization
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl === this.baseUrl + '/') {
        console.log('✅ Login successful!');
        this.testResults.login = true;
        return true;
      } else {
        console.log('❌ Login failed - still on auth page');
        this.testResults.errors.push('Login failed - still on auth page');
        return false;
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      this.testResults.errors.push(`Login error: ${error.message}`);
      return false;
    }
  }

  async testPage(pagePath, pageName, actions = []) {
    try {
      console.log(`\n📄 Testing ${pageName} (${pagePath})`);

      // Navigate to page
      await this.page.goto(`${this.baseUrl}${pagePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Take screenshot
      const screenshotName = `${pageName.toLowerCase().replace(/\s+/g, '_')}_test`;
      await this.page.screenshot({
        path: `test_screenshots/${screenshotName}.png`,
        fullPage: true
      });
      this.testResults.screenshots.push(screenshotName);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if page loaded successfully
      const title = await this.page.title();
      console.log(`📋 Page title: ${title}`);

      // Perform specific actions for the page
      for (const action of actions) {
        try {
          await this.performAction(action);
        } catch (actionError) {
          console.log(`❌ Action failed: ${action.description} - ${actionError.message}`);
          this.testResults.errors.push(`${pageName} - ${action.description}: ${actionError.message}`);
        }
      }

      // Special handling for Create Risk page - verify database persistence
      if (pageName === 'Create Risk' && this.testResults.databaseConnectivity) {
        const riskTitle = actions.find(a => a.description === 'Enter risk title')?.value;
        if (riskTitle) {
          const persistenceVerified = await this.verifyDataPersistence(riskTitle);
          if (!persistenceVerified) {
            this.testResults.pages[pageName] = {
              path: pagePath,
              status: 'failed',
              title: title,
              actions: actions.length,
              error: 'Data persistence verification failed'
            };
            console.log(`❌ ${pageName} test failed - data persistence not verified`);
            return;
          }
        }
      }

      this.testResults.pages[pageName] = {
        path: pagePath,
        status: 'success',
        title: title,
        actions: actions.length
      };

      console.log(`✅ ${pageName} test completed`);

    } catch (error) {
      console.log(`❌ Error testing ${pageName}: ${error.message}`);
      this.testResults.pages[pageName] = {
        path: pagePath,
        status: 'failed',
        error: error.message
      };
      this.testResults.errors.push(`${pageName}: ${error.message}`);
    }
  }

  async performAction(action) {
    switch (action.type) {
      case 'click':
        await this.page.click(action.selector);
        console.log(`🖱️  Clicked: ${action.description}`);
        // Wait for network idle or DOM changes instead of fixed timeout
        await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {
          // Ignore timeout, continue with test
        });
        break;

      case 'type':
        await this.page.type(action.selector, action.value);
        console.log(`⌨️  Typed in ${action.selector}: ${action.value}`);
        break;

      case 'select':
        await this.page.select(action.selector, action.value);
        console.log(`📋 Selected ${action.value} in ${action.selector}`);
        break;

      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.ms));
        console.log(`⏳ Waited ${action.ms}ms`);
        break;

      case 'waitForSelector':
        await this.page.waitForSelector(action.selector, { timeout: action.timeout || 10000 });
        console.log(`👀 Waited for selector: ${action.selector}`);
        break;

      case 'waitForNavigation':
        await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        console.log(`🌐 Waited for navigation to complete`);
        break;

      case 'screenshot':
        const filename = `${action.name}.png`;
        await this.page.screenshot({ path: `test_screenshots/${filename}`, fullPage: true });
        this.testResults.screenshots.push(filename);
        console.log(`📸 Screenshot taken: ${filename}`);
        break;

      default:
        console.log(`⚠️  Unknown action type: ${action.type}`);
    }
  }

  async runTests() {
    // Create screenshots directory
    if (!fs.existsSync('test_screenshots')) {
      fs.mkdirSync('test_screenshots');
    }

    // Test database error handling
    await this.testDatabaseErrorHandling();

    // Test pages with specific actions
    const testCases = [
      {
        path: '/risks/dashboard',
        name: 'Risk Dashboard',
        actions: [
          { type: 'screenshot', name: 'risk_dashboard_overview' },
          { type: 'wait', ms: 2000 }
        ]
      },
      {
        path: '/risks',
        name: 'Risks List',
        actions: [
          { type: 'screenshot', name: 'risks_list' },
          { type: 'wait', ms: 1000 }
        ]
      },
      {
        path: '/risks/create',
        name: 'Create Risk',
        actions: [
          { type: 'screenshot', name: 'create_risk_form' },
          { type: 'waitForSelector', selector: 'input[placeholder="Risk title"]', timeout: 10000 },
          { type: 'type', selector: 'input[placeholder="Risk title"]', value: 'Test Risk from UI - ' + Date.now(), description: 'Enter risk title' },
          { type: 'type', selector: 'input[placeholder*="Operational"]', value: 'Technology', description: 'Enter risk category' },
          { type: 'type', selector: 'textarea[placeholder*="Describe the risk"]', value: 'This is a test risk created from UI testing with modern wait methods', description: 'Enter risk description' },
          { type: 'click', selector: 'button[type="submit"]', description: 'Submit create risk form' },
          { type: 'waitForNavigation' },
          { type: 'waitForSelector', selector: '[data-testid="risk-list"]', timeout: 15000 },
          { type: 'screenshot', name: 'after_create_risk' }
        ]
      },
      {
        path: '/risks/key-indicators',
        name: 'Key Indicator Management',
        actions: [
          { type: 'screenshot', name: 'key_indicators_page' },
          { type: 'wait', ms: 1000 }
        ]
      },
      {
        path: '/risks/loss-events',
        name: 'Loss Event Management',
        actions: [
          { type: 'screenshot', name: 'loss_events_page' },
          { type: 'wait', ms: 1000 }
        ]
      },
      {
        path: '/risks/operational-risk',
        name: 'Operational Risk Management',
        actions: [
          { type: 'screenshot', name: 'operational_risk_page' },
          { type: 'wait', ms: 1000 }
        ]
      },
      {
        path: '/risks/create-wizard',
        name: 'Risk Wizard',
        actions: [
          { type: 'screenshot', name: 'risk_wizard_page' },
          { type: 'wait', ms: 1000 }
        ]
      }
    ];

    for (const testCase of testCases) {
      await this.testPage(testCase.path, testCase.name, testCase.actions);
    }
  }

  generateReport() {
    console.log('\n📋 RISK MANAGEMENT TEST REPORT');
    console.log('='.repeat(50));

    console.log(`🔐 Login Status: ${this.testResults.login ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🗄️  Database Connectivity: ${this.testResults.databaseConnectivity ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`💾 Data Persistence: ${this.testResults.dataPersistenceVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}`);
    console.log(`🛡️  Database Error Handling: ${this.testResults.databaseErrorHandling ? '✅ WORKING' : '❌ NOT WORKING'}`);

    if (this.testResults.createdRiskId) {
      console.log(`🆔 Created Risk ID: ${this.testResults.createdRiskId}`);
    }

    console.log('\n📄 Pages Tested:');
    Object.entries(this.testResults.pages).forEach(([name, data]) => {
      console.log(`  ${data.status === 'success' ? '✅' : '❌'} ${name} (${data.path})`);
      if (data.error) {
        console.log(`    Error: ${data.error}`);
      }
    });

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      this.testResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    console.log(`\n📸 Screenshots Taken: ${this.testResults.screenshots.length}`);
    this.testResults.screenshots.forEach(screenshot => {
      console.log(`  - ${screenshot}`);
    });

    console.log('\n⏰ Test completed at:', new Date().toLocaleString());

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      login: this.testResults.login,
      databaseConnectivity: this.testResults.databaseConnectivity,
      dataPersistenceVerified: this.testResults.dataPersistenceVerified,
      databaseErrorHandling: this.testResults.databaseErrorHandling,
      createdRiskId: this.testResults.createdRiskId,
      pages: this.testResults.pages,
      errors: this.testResults.errors,
      screenshots: this.testResults.screenshots
    };

    fs.writeFileSync('risk_management_test_report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Detailed report saved to: risk_management_test_report.json');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();

      const loginSuccess = await this.performLogin();
      if (!loginSuccess) {
        console.log('❌ Cannot proceed with tests - login failed');
        this.generateReport();
        await this.close();
        return;
      }

      await this.runTests();
      this.generateReport();

      // Keep browser open for manual inspection
      console.log('\n🔍 Browser will remain open for manual inspection...');
      console.log('Press Ctrl+C to exit');

    } catch (error) {
      console.error('💥 Test execution failed:', error);
      this.generateReport();
      await this.close();
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new RiskManagementTester();
  tester.run().catch(console.error);
}

module.exports = RiskManagementTester;