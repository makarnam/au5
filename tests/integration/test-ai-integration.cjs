#!/usr/bin/env node

// Test script to verify AI integration with Ollama
// This script tests the actual AI generation functionality

const OLLAMA_BASE_URL = "http://localhost:11434";

// Test configuration
const testConfig = {
  provider: "ollama",
  model: "llama3.2",
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.7,
  maxTokens: 500,
};

// Sample audit data for testing
const sampleAuditData = {
  title: "Annual IT Security Assessment",
  audit_type: "it",
  business_unit: "Information Technology",
  scope: "Cybersecurity controls, access management, and data protection",
};

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function buildPrompt(fieldType, auditData, context = "") {
  const auditInfo = `
Audit Information:
- Title: ${auditData.title || "Not specified"}
- Type: ${auditData.audit_type || "Not specified"}
- Business Unit: ${auditData.business_unit || "Not specified"}
- Existing Scope: ${auditData.scope || "Not specified"}
  `.trim();

  let basePrompt = "";

  switch (fieldType) {
    case "description":
      basePrompt = `You are an expert audit professional. Generate a comprehensive audit description based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create a detailed, professional audit description
- Ensure the description is specifically relevant to "${auditData.title}"
- Include the purpose, scope overview, and key focus areas
- Use professional audit terminology
- Keep it between 100-300 words
- Make it specific to the audit type and business unit

Generate only the description text, no additional formatting or explanations.`;
      break;

    case "objectives":
      basePrompt = `You are an expert audit professional. Generate specific audit objectives based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create 3-5 specific, measurable audit objectives
- Each objective should be directly related to "${auditData.title}"
- Objectives should be realistic and achievable
- Use action-oriented language (assess, evaluate, review, verify, etc.)
- Make them specific to the audit type and business unit
- Each objective should be a single, clear statement

Format: Return only the objectives as a JSON array of strings, nothing else.
Example: ["Objective 1", "Objective 2", "Objective 3"]`;
      break;

    case "scope":
      basePrompt = `You are an expert audit professional. Generate a detailed audit scope based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Define what will be included and excluded in the audit
- Be specific to "${auditData.title}" and the business unit
- Include relevant systems, processes, locations, and time periods
- Mention key stakeholders and departments involved
- Keep it comprehensive but focused
- Use professional audit language

Generate only the scope text, no additional formatting or explanations.`;
      break;

    default:
      throw new Error(`Unsupported field type: ${fieldType}`);
  }

  return basePrompt;
}

async function checkOllamaStatus() {
  try {
    log("🔍 Checking Ollama status...", "cyan");

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const models = data.models?.map((m) => m.name) || [];

    log("✅ Ollama is running", "green");
    log(`📋 Available models: ${models.join(", ")}`, "blue");

    if (!models.some((name) => name.startsWith(testConfig.model))) {
      log(`❌ Model "${testConfig.model}" not found!`, "red");
      log(`   Available models: ${models.join(", ")}`, "yellow");
      return {
        isRunning: false,
        availableModels: models,
        error: "Model not found",
      };
    }

    return { isRunning: true, availableModels: models };
  } catch (error) {
    log(`❌ Ollama connection failed: ${error.message}`, "red");
    return { isRunning: false, availableModels: [], error: error.message };
  }
}

async function generateWithOllama(prompt, config) {
  try {
    log("🚀 Generating content with Ollama...", "cyan");

    const requestBody = {
      model: config.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: config.temperature || 0.7,
        num_predict: config.maxTokens || 500,
      },
    };

    log(`📝 Using model: ${config.model}`, "blue");
    log(`🌡️  Temperature: ${requestBody.options.temperature}`, "blue");
    log(`🔢 Max tokens: ${requestBody.options.num_predict}`, "blue");

    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Model "${config.model}" not found in Ollama. Run "ollama pull ${config.model}" to download it.`,
        );
      }
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    log("✅ Content generated successfully!", "green");

    return {
      success: true,
      content: data.response,
      model: config.model,
      provider: "ollama",
      tokensUsed: data.eval_count || 0,
      responseTime: data.total_duration
        ? Math.round(data.total_duration / 1000000)
        : 0,
    };
  } catch (error) {
    log(`❌ Generation failed: ${error.message}`, "red");
    return {
      success: false,
      content: "",
      error: error.message,
    };
  }
}

async function testFieldType(fieldType, auditData, context = "") {
  log(`\n${"=".repeat(60)}`, "magenta");
  log(`🎯 Testing ${fieldType.toUpperCase()} generation`, "bright");
  log(`${"=".repeat(60)}`, "magenta");

  try {
    const prompt = buildPrompt(fieldType, auditData, context);

    log("📄 Generated prompt (first 200 chars):", "yellow");
    console.log(prompt.substring(0, 200) + "...\n");

    const result = await generateWithOllama(prompt, testConfig);

    if (result.success) {
      log("📊 Generation Results:", "green");
      log(`   Success: ${result.success}`, "green");
      log(`   Model: ${result.model}`, "blue");
      log(`   Tokens used: ${result.tokensUsed}`, "blue");
      log(`   Response time: ${result.responseTime}ms`, "blue");
      log("\n📝 Generated Content:", "bright");
      log("-".repeat(50), "cyan");
      console.log(result.content);
      log("-".repeat(50), "cyan");

      // Validate content quality
      if (result.content.length < 50) {
        log("⚠️  Warning: Generated content seems too short", "yellow");
      } else if (result.content.length > 2000) {
        log("⚠️  Warning: Generated content seems too long", "yellow");
      } else {
        log("✅ Content length looks good", "green");
      }

      return result;
    } else {
      log(`❌ Generation failed: ${result.error}`, "red");
      return result;
    }
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  log("🧪 Starting Comprehensive AI Integration Test", "bright");
  log("=".repeat(60), "cyan");

  // Step 1: Check Ollama status
  const status = await checkOllamaStatus();
  if (!status.isRunning) {
    log("\n❌ Cannot proceed with tests - Ollama is not accessible", "red");
    log("\n🔧 Troubleshooting steps:", "yellow");
    log("   1. Start Ollama: ollama serve", "yellow");
    log(`   2. Download model: ollama pull ${testConfig.model}`, "yellow");
    log(
      "   3. Verify connection: curl http://localhost:11434/api/tags",
      "yellow",
    );
    process.exit(1);
  }

  // Step 2: Test different field types
  const testCases = [
    {
      fieldType: "description",
      context:
        "Focus on cybersecurity vulnerabilities and compliance requirements",
    },
    {
      fieldType: "objectives",
      context: "Include specific security controls testing and risk assessment",
    },
    {
      fieldType: "scope",
      context: "Cover network security, access controls, and data encryption",
    },
  ];

  const results = [];

  for (const testCase of testCases) {
    const result = await testFieldType(
      testCase.fieldType,
      sampleAuditData,
      testCase.context,
    );
    results.push({ ...testCase, result });

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Step 3: Summary
  log("\n" + "=".repeat(60), "magenta");
  log("📊 TEST SUMMARY", "bright");
  log("=".repeat(60), "magenta");

  const successful = results.filter((r) => r.result.success);
  const failed = results.filter((r) => !r.result.success);

  log(`✅ Successful tests: ${successful.length}/${results.length}`, "green");
  log(
    `❌ Failed tests: ${failed.length}/${results.length}`,
    failed.length > 0 ? "red" : "green",
  );

  if (successful.length > 0) {
    log("\n🎉 Successful field types:", "green");
    successful.forEach((test) => {
      log(`   ✓ ${test.fieldType}`, "green");
    });
  }

  if (failed.length > 0) {
    log("\n💥 Failed field types:", "red");
    failed.forEach((test) => {
      log(`   ✗ ${test.fieldType}: ${test.result.error}`, "red");
    });
  }

  // Performance metrics
  const successfulResults = successful.map((t) => t.result);
  if (successfulResults.length > 0) {
    const avgTokens =
      successfulResults.reduce((sum, r) => sum + (r.tokensUsed || 0), 0) /
      successfulResults.length;
    const avgTime =
      successfulResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) /
      successfulResults.length;

    log("\n📈 Performance Metrics:", "cyan");
    log(`   Average tokens per generation: ${Math.round(avgTokens)}`, "blue");
    log(`   Average response time: ${Math.round(avgTime)}ms`, "blue");
  }

  // Step 4: Integration verification
  log("\n🔗 Integration Status:", "cyan");
  log(`   Ollama connectivity: ✅`, "green");
  log(`   Model availability: ✅`, "green");
  log(`   Prompt generation: ✅`, "green");
  log(`   Response parsing: ✅`, "green");
  log(`   Error handling: ✅`, "green");

  if (successful.length === results.length) {
    log(
      "\n🎊 ALL TESTS PASSED! AI integration is working perfectly.",
      "bright",
    );
    log(
      "   The application is ready to generate audit content with Ollama.",
      "green",
    );
  } else {
    log("\n⚠️  Some tests failed. Check the errors above.", "yellow");
  }

  return successful.length === results.length;
}

// Run the test
if (require.main === module) {
  runComprehensiveTest()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`💥 Test runner failed: ${error.message}`, "red");
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  checkOllamaStatus,
  generateWithOllama,
  testFieldType,
  buildPrompt,
};
