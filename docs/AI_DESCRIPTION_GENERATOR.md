# AI Description Generator for Audit Creation

## Overview

The AI Description Generator feature allows users to automatically generate audit descriptions based on the audit name/title using AI models. This feature is integrated into both the main Audit Form and the Audit Wizard components.

## Features

- **Smart Description Generation**: Automatically generates relevant audit descriptions based on audit name, type, and business unit
- **Multiple AI Providers**: Supports OpenAI, Claude, Gemini, and local Ollama models
- **Context-Aware**: Uses audit context (title, type, business unit) to generate relevant descriptions
- **Real-time Generation**: AI button appears when audit name is entered
- **Customizable**: Users can provide additional context for better results

## How It Works

### 1. Audit Form Integration

When creating or editing an audit:

1. Enter an **Audit Name/Title**
2. The **AI Generate** button appears next to the Description field
3. Click the button to open the AI generator dialog
4. Select your preferred AI configuration
5. Optionally add additional context
6. Click **Generate** to create a description
7. Review and **Accept** the generated content

### 2. Supported AI Providers

- **OpenAI GPT Models** (GPT-3.5, GPT-4)
- **Anthropic Claude** (Claude-3 series)
- **Google Gemini** (Gemini Pro)
- **Local Ollama** (Various local models)

### 3. Context Information

The AI uses the following context to generate descriptions:

- **Audit Title**: The main audit name
- **Audit Type**: Internal, External, Compliance, etc.
- **Business Unit**: The target business unit
- **Additional Context**: User-provided context (optional)

## Usage Examples

### Example 1: IT Security Audit

**Input:**
- Title: "Annual IT Security Assessment"
- Type: "IT"
- Business Unit: "Information Technology"

**Generated Description:**
```
Comprehensive annual security assessment focusing on IT infrastructure, data protection, access controls, and cybersecurity measures. This audit evaluates the effectiveness of security policies, procedures, and technical controls to ensure compliance with industry standards and regulatory requirements.
```

### Example 2: Financial Controls Audit

**Input:**
- Title: "Q4 Financial Controls Review"
- Type: "Financial"
- Business Unit: "Finance"

**Generated Description:**
```
Quarterly review of financial controls and processes to ensure accuracy, completeness, and compliance with accounting standards. This audit examines internal controls over financial reporting, segregation of duties, authorization procedures, and financial statement preparation processes.
```

## Setup Requirements

### 1. AI Configuration

Before using the AI generator, you need to configure at least one AI provider:

1. Go to **Settings** → **AI Configuration**
2. Add a new configuration:
   - Choose provider (OpenAI, Claude, Gemini, or Ollama)
   - Enter API key (if required)
   - Select model
   - Configure temperature and max tokens
3. Test the connection
4. Save the configuration

### 2. For Ollama (Local Models)

If using Ollama:

1. Install Ollama locally
2. Pull desired models: `ollama pull llama2`
3. Configure Ollama endpoint in AI settings
4. No API key required

## Best Practices

### 1. Writing Effective Audit Titles

- Be specific and descriptive
- Include the audit scope or focus area
- Mention the time period if applicable
- Examples:
  - ✅ "Q1 2024 Procurement Process Audit"
  - ✅ "SOX Compliance Review - Financial Controls"
  - ❌ "Audit 1" or "Review"

### 2. Providing Additional Context

Add context for better results:
- Special focus areas or concerns
- Regulatory requirements
- Previous audit findings
- Specific objectives or scope limitations

### 3. Review and Customize

- Always review generated descriptions
- Modify as needed for your specific requirements
- Consider organizational terminology and standards
- Ensure alignment with audit objectives

## Technical Implementation

### Component Integration

The AI generator is implemented as a reusable component (`AIGenerator.tsx`) that can be integrated into any form field. It supports:

- Different field types (description, objectives, scope, methodology)
- Context-aware prompts
- Multiple AI providers
- Real-time generation status
- Error handling and validation

### API Integration

The feature uses the `aiService` which provides:

- Provider abstraction layer
- Configuration management
- Generation logging
- Error handling
- Rate limiting support

## Troubleshooting

### Common Issues

1. **AI Generate button not appearing**
   - Ensure audit title/name is entered
   - Check if AI configurations exist

2. **Generation fails**
   - Verify API key is correct
   - Check network connectivity
   - Review provider-specific rate limits

3. **Poor quality descriptions**
   - Provide more specific audit titles
   - Add additional context
   - Try different AI models

### Error Messages

- **"Please select an AI configuration first"**: Configure AI provider in settings
- **"Please provide an audit title before generating content"**: Enter audit name first
- **"Failed to generate content"**: Check API configuration and connectivity

## Future Enhancements

- **Template-based Generation**: Pre-defined templates for common audit types
- **Multi-language Support**: Generate descriptions in different languages
- **Batch Generation**: Generate multiple descriptions at once
- **Learning from History**: Improve suggestions based on past audits
- **Integration with Standards**: Align with ISO, COSO, and other frameworks

## Feedback and Support

For questions or suggestions about the AI Description Generator:

1. Check the troubleshooting section above
2. Review AI configuration settings
3. Contact your system administrator
4. Submit feedback through the application

---

*This feature leverages advanced AI capabilities to streamline audit planning and documentation, helping auditors create comprehensive and relevant audit descriptions quickly and efficiently.*