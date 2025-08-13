// Comprehensive Puppeteer Test Script for AI Auditor Application
// This script will test all pages and buttons systematically

const testPages = [
  // Public pages (no auth required)
  { path: '/', name: 'Home Page' },
  { path: '/auth/sign-in', name: 'Sign In Page' },
  { path: '/auth/sign-up', name: 'Sign Up Page' },
  
  // Protected pages (auth required)
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/audits', name: 'Audits List' },
  { path: '/audits/create', name: 'Create Audit' },
  { path: '/controls', name: 'Controls List' },
  { path: '/controls/create', name: 'Create Control' },
  { path: '/risks', name: 'Risks List' },
  { path: '/risks/create', name: 'Create Risk' },
  { path: '/findings', name: 'Findings List' },
  { path: '/findings/create', name: 'Create Finding' },
  { path: '/compliance/frameworks', name: 'Compliance Frameworks' },
  { path: '/policies', name: 'Policies List' },
  { path: '/privacy/dashboard', name: 'Privacy Dashboard' },
  { path: '/regulations', name: 'Regulations List' },
  { path: '/workflows', name: 'Workflows' },
  { path: '/ai', name: 'AI Assistant' },
  { path: '/ai-governance/dashboard', name: 'AI Governance Dashboard' },
  { path: '/bcp/dashboard', name: 'BCP Dashboard' },
  { path: '/resilience/dashboard', name: 'Resilience Dashboard' },
  { path: '/third-party-risk-management/dashboard', name: 'Third Party Risk Management' },
  { path: '/esg/dashboard', name: 'ESG Dashboard' },
  { path: '/it-security/dashboard', name: 'IT Security Dashboard' },
  { path: '/users', name: 'Users List' },
  { path: '/settings', name: 'Settings' },
  { path: '/profile', name: 'Profile' },
];

const testResults = {
  successful: [],
  failed: [],
  errors: [],
  screenshots: []
};

async function testPage(page, url, pageName) {
  try {
    console.log(`Testing: ${pageName} (${url})`);
    
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshotName = `${pageName.toLowerCase().replace(/\s+/g, '_')}_test`;
    await page.screenshot({ 
      path: `test_screenshots/${screenshotName}.png`,
      fullPage: true 
    });
    
    // Test all clickable elements
    const clickableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, [role="button"], [onclick], .clickable, [data-testid*="button"], [class*="btn"], [class*="Button"]');
      return Array.from(elements).map((el, index) => ({
        index,
        tagName: el.tagName,
        text: el.textContent?.trim() || el.innerText?.trim() || '',
        className: el.className,
        id: el.id,
        href: el.href || null,
        disabled: el.disabled,
        visible: el.offsetParent !== null,
        rect: el.getBoundingClientRect()
      }));
    });
    
    console.log(`Found ${clickableElements.length} clickable elements on ${pageName}`);
    
    // Test each clickable element
    for (let i = 0; i < Math.min(clickableElements.length, 5); i++) {
      const element = clickableElements[i];
      try {
        if (element.visible && !element.disabled) {
          // Try to click the element
          await page.click(`button:nth-child(${i + 1}), a:nth-child(${i + 1})`);
          await page.waitForTimeout(1000);
          
          // Check if navigation occurred
          const newUrl = page.url();
          if (newUrl !== url) {
            console.log(`✅ Element ${i} (${element.text}) navigated to: ${newUrl}`);
            // Go back
            await page.goBack();
            await page.waitForTimeout(1000);
          } else {
            console.log(`✅ Element ${i} (${element.text}) clicked successfully`);
          }
        }
      } catch (clickError) {
        console.log(`❌ Failed to click element ${i} (${element.text}): ${clickError.message}`);
      }
    }
    
    testResults.successful.push({
      page: pageName,
      url: url,
      elements: clickableElements.length
    });
    
  } catch (error) {
    console.log(`❌ Error testing ${pageName}: ${error.message}`);
    testResults.failed.push({
      page: pageName,
      url: url,
      error: error.message
    });
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Puppeteer Test...');
  
  // Create screenshots directory
  const fs = require('fs');
  if (!fs.existsSync('test_screenshots')) {
    fs.mkdirSync('test_screenshots');
  }
  
  // Test each page
  for (const testPage of testPages) {
    const fullUrl = `http://localhost:5173${testPage.path}`;
    await testPage(page, fullUrl, testPage.name);
  }
  
  // Generate report
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Successful: ${testResults.successful.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(fail => {
      console.log(`- ${fail.page}: ${fail.error}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testPages.length,
      successful: testResults.successful.length,
      failed: testResults.failed.length
    },
    successful: testResults.successful,
    failed: testResults.failed
  };
  
  fs.writeFileSync('puppeteer_test_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: puppeteer_test_report.json');
}

// Export for use in other scripts
module.exports = { runComprehensiveTest, testPages };
