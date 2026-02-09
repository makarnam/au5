import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  Settings, 
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiService, AIConfiguration } from '../../services/aiService';
import { RiskControlMatrix, MatrixCell, RiskLevel, ControlEffectivenessLevel } from '../../types/riskControlMatrix';
import { Risk, Control } from '../../types';

interface AIMatrixGeneratorProps {
  onMatrixGenerated: (matrix: RiskControlMatrix, cells: MatrixCell[]) => void;
  existingRisks?: Risk[];
  existingControls?: Control[];
  businessUnitId?: string;
  className?: string;
  onOpenAIConfig?: () => void; // New prop for opening AI config
}

interface GenerationConfig {
  industry: string;
  businessSize: string;
  riskCategories: string[];
  controlFrameworks: string[];
  matrixSize: "3x3" | "4x4" | "5x5";
  includeExistingRisks: boolean;
  includeExistingControls: boolean;
  generationFocus: "comprehensive" | "focused" | "minimal";
  customPrompt?: string;
}

const industries = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Energy",
  "Transportation",
  "Education",
  "Government",
  "Non-Profit",
  "Other"
];

const businessSizes = [
  "Startup (1-50 employees)",
  "Small (51-200 employees)",
  "Medium (201-1000 employees)",
  "Large (1001-5000 employees)",
  "Enterprise (5000+ employees)"
];

const riskCategories = [
  "Operational Risk",
  "Financial Risk",
  "Strategic Risk",
  "Compliance Risk",
  "Technology Risk",
  "Cybersecurity Risk",
  "Third-Party Risk",
  "Environmental Risk",
  "Reputational Risk",
  "Legal Risk"
];

const controlFrameworks = [
  "COSO",
  "ISO 27001",
  "SOX",
  "NIST",
  "COBIT",
  "PCI DSS",
  "ISO 31000",
  "Custom"
];

const AIMatrixGenerator: React.FC<AIMatrixGeneratorProps> = ({
  onMatrixGenerated,
  existingRisks = [],
  existingControls = [],
  businessUnitId,
  className = "",
  onOpenAIConfig
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfigurations, setAiConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedAiConfig, setSelectedAiConfig] = useState<AIConfiguration | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<GenerationConfig>({
    industry: "Technology",
    businessSize: "Medium (201-1000 employees)",
    riskCategories: ["Operational Risk", "Technology Risk"],
    controlFrameworks: ["COSO", "ISO 27001"],
    matrixSize: "5x5",
    includeExistingRisks: true,
    includeExistingControls: true,
    generationFocus: "comprehensive"
  });

  useEffect(() => {
    loadAiConfigurations();
  }, []);

  const loadAiConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      console.log("Loaded AI configurations:", configs);
      
      // Filter out invalid configurations
      const validConfigs = configs.filter(config => 
        config.provider && 
        config.provider !== 'undefined' && 
        config.provider !== undefined &&
        config.model_name
      );
      
      setAiConfigurations(validConfigs);
      
      if (validConfigs.length > 0) {
        setSelectedAiConfig(validConfigs[0]);
        console.log("Selected AI config:", validConfigs[0]);
      } else {
        console.warn("No valid AI configurations found");
        toast.error("No valid AI configurations found. Please set up your AI configuration.");
      }
    } catch (error) {
      console.error("Error loading AI configurations:", error);
      toast.error("Failed to load AI configurations");
    }
  };

  const buildPrompt = (): string => {
    const existingRisksText = config.includeExistingRisks && existingRisks.length > 0
      ? `\nExisting Risks: ${existingRisks.map(r => `${r.title} (${r.risk_level})`).join(', ')}`
      : '';

    const existingControlsText = config.includeExistingControls && existingControls.length > 0
      ? `\nExisting Controls: ${existingControls.map(c => `${c.title} (${c.control_type})`).join(', ')}`
      : '';

    // Determine matrix dimensions based on size
    const matrixDimensions = config.matrixSize === "3x3" ? 3 : 
                           config.matrixSize === "4x4" ? 4 : 5;
    
    const riskLevels = matrixDimensions === 3 ? ["Low", "Medium", "High"] :
                      matrixDimensions === 4 ? ["Low", "Medium", "High", "Critical"] :
                      ["Very Low", "Low", "Medium", "High", "Critical"];
    
    const controlLevels = matrixDimensions === 3 ? ["Ineffective", "Partially Effective", "Effective"] :
                         matrixDimensions === 4 ? ["Ineffective", "Partially Effective", "Effective", "Highly Effective"] :
                         ["Ineffective", "Weak", "Partially Effective", "Effective", "Highly Effective"];

    const basePrompt = `You are an expert in Risk Management and Control Frameworks. Generate a comprehensive Risk-Control Matrix based on the following specifications:

Industry: ${config.industry}
Business Size: ${config.businessSize}
Risk Categories: ${config.riskCategories.join(', ')}
Control Frameworks: ${config.controlFrameworks.join(', ')}
Matrix Size: ${config.matrixSize} (${matrixDimensions}x${matrixDimensions})
Generation Focus: ${config.generationFocus}${existingRisksText}${existingControlsText}

Requirements:
1. Create a ${config.matrixSize} risk-control matrix with ${matrixDimensions * matrixDimensions} cells
2. Use risk levels: ${riskLevels.join(', ')}
3. Use control effectiveness levels: ${controlLevels.join(', ')}
4. Generate appropriate color coding for each matrix cell (green for low risk/high effectiveness, red for high risk/low effectiveness)
5. Provide specific action requirements for each cell
6. Consider industry best practices and regulatory requirements for ${config.industry}
7. Ensure the matrix is comprehensive and actionable

${config.customPrompt ? `\nAdditional Requirements: ${config.customPrompt}` : ''}

IMPORTANT: Respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. The JSON must be complete and properly formatted.

Expected JSON structure:
{
  "matrix": {
    "name": "Comprehensive Risk-Control Matrix for ${config.industry}",
    "description": "A ${config.matrixSize} matrix covering ${config.riskCategories.join(', ')} risks with ${config.controlFrameworks.join(', ')} frameworks",
    "matrix_type": "${config.matrixSize}",
    "risk_levels": ${JSON.stringify(riskLevels)},
    "control_effectiveness_levels": ${JSON.stringify(controlLevels)}
  },
  "cells": [
    {
      "position_x": 0,
      "position_y": 0,
      "risk_level": "${riskLevels[0]}",
      "control_effectiveness": "${controlLevels[0]}",
      "color_code": "#10b981",
      "description": "Low risk with ineffective controls - requires immediate attention",
      "action_required": "Implement basic controls immediately"
    }
  ]
}

Generate exactly ${matrixDimensions * matrixDimensions} cells, one for each position in the ${matrixDimensions}x${matrixDimensions} matrix.`;

    return basePrompt;
  };

  // Function to complete truncated cells array
  const completeCellsArray = (cellsContent: string): string => {
    // Count existing cells
    const existingCells = (cellsContent.match(/\{/g) || []).length;
    
    // Determine matrix size from the content
    const matrixSizeMatch = cellsContent.match(/"matrix_type":\s*"(\d+x\d+)"/);
    const matrixSize = matrixSizeMatch ? matrixSizeMatch[1] : "5x5";
    const dimensions = parseInt(matrixSize.split('x')[0]);
    const totalCells = dimensions * dimensions;
    
    // If we have all cells, just return the content
    if (existingCells >= totalCells) {
      return cellsContent;
    }
    
    // Generate missing cells
    const missingCells = [];
    for (let i = existingCells; i < totalCells; i++) {
      const x = (i % dimensions) + 1;
      const y = Math.floor(i / dimensions) + 1;
      
      // Determine risk and control levels based on position
      const riskLevels = dimensions === 3 ? ["low", "medium", "high"] :
                        dimensions === 4 ? ["low", "medium", "high", "critical"] :
                        ["low", "medium", "high", "critical"];
      
      const controlLevels = dimensions === 3 ? ["excellent", "good", "adequate"] :
                           dimensions === 4 ? ["excellent", "good", "adequate", "weak"] :
                           ["excellent", "good", "adequate", "weak", "inadequate"];
      
      const riskLevel = riskLevels[Math.min(x - 1, riskLevels.length - 1)];
      const controlLevel = controlLevels[Math.min(y - 1, controlLevels.length - 1)];
      
      // Determine color based on risk and control levels
      let colorCode = '#FFA500'; // Default orange
      if (x <= 2 && y >= dimensions - 1) {
        colorCode = '#10b981'; // Green for low risk, high effectiveness
      } else if (x >= dimensions - 1 && y <= 2) {
        colorCode = '#ef4444'; // Red for high risk, low effectiveness
      }
      
      const cell = `{
        "risk_level": "${riskLevel}",
        "control_effectiveness": "${controlLevel}",
        "position_x": ${x},
        "position_y": ${y},
        "color_code": "${colorCode}",
        "description": "${riskLevel} risk with ${controlLevel} control effectiveness",
        "action_required": "${x >= dimensions - 1 ? 'Immediate action required' : y <= 2 ? 'Improve controls' : 'Monitor and review'}"
      }`;
      
      missingCells.push(cell);
    }
    
    return cellsContent + (cellsContent.trim().endsWith(',') ? '' : ',') + missingCells.join(',');
  };

  // Simple JSON validation to identify syntax errors
  const validateJSON = (content: string): { isValid: boolean; error?: string; position?: number } => {
    try {
      JSON.parse(content);
      return { isValid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Try to extract position information from error message
      const positionMatch = errorMessage.match(/position (\d+)/);
      const position = positionMatch ? parseInt(positionMatch[1]) : undefined;
      
      return {
        isValid: false,
        error: errorMessage,
        position
      };
    }
  };

  // Robust JSON parsing function to handle AI-generated JSON issues
  const parseAIResponse = (content: string): any => {
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Check if the content looks like JSON
    if (!cleanedContent.startsWith('{') && !cleanedContent.startsWith('[')) {
      throw new Error("AI response is not in JSON format");
    }

    // Try multiple parsing strategies
    const parsingStrategies = [
      // Strategy 1: Direct parsing
      () => JSON.parse(cleanedContent),
      
      // Strategy 2: Fix common quote issues
      () => {
        let fixed = cleanedContent;
        // Fix unescaped quotes in strings by escaping them
        fixed = fixed.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
          return `"${p1}${p2.replace(/"/g, '\\"')}${p3}"`;
        });
        // Fix single quotes that should be double quotes
        fixed = fixed.replace(/'/g, '"');
        return JSON.parse(fixed);
      },
      
      // Strategy 3: Remove trailing commas and fix incomplete objects
      () => {
        let fixed = cleanedContent;
        // Remove trailing commas before closing braces/brackets
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        // Fix incomplete strings by adding closing quotes
        fixed = fixed.replace(/"([^"]*)$/g, '$1"');
        return JSON.parse(fixed);
      },
      
      // Strategy 4: Extract JSON from mixed content
      () => {
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No valid JSON object found");
      },
      
      // Strategy 5: Manual repair for common AI issues
      () => {
        let fixed = cleanedContent;
        
        // Fix common AI JSON issues
        fixed = fixed.replace(/,\s*}/g, '}'); // Remove trailing commas
        fixed = fixed.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        fixed = fixed.replace(/:\s*"([^"]*)\s*$/gm, ':"$1"'); // Fix incomplete strings
        fixed = fixed.replace(/:\s*"([^"]*)\s*([^"]*)"\s*([^"]*)/g, ':"$1$2$3"'); // Fix broken strings
        
        // Ensure proper closing
        const braceCount = (fixed.match(/\{/g) || []).length;
        let closeBraceCount = (fixed.match(/\}/g) || []).length;
        while (closeBraceCount < braceCount) {
          fixed += '}';
          closeBraceCount++;
        }
        
        return JSON.parse(fixed);
      },
      
      // Strategy 6: Advanced string repair for unterminated strings
      () => {
        let fixed = cleanedContent;
        
        // Find and fix unterminated strings
        const stringRegex = /"([^"]*)(?=\s*[,}\]])/g;
        let match;
        let offset = 0;
        
        while ((match = stringRegex.exec(fixed)) !== null) {
          const startPos = match.index + offset;
          const endPos = startPos + match[0].length;
          const beforeMatch = fixed.substring(0, startPos);
          const afterMatch = fixed.substring(endPos);
          
          // Check if this looks like an unterminated string
          if (!afterMatch.startsWith('"')) {
            // Find the next quote or end of value
            const nextQuote = afterMatch.indexOf('"');
            const nextComma = afterMatch.indexOf(',');
            const nextBrace = afterMatch.indexOf('}');
            const nextBracket = afterMatch.indexOf(']');
            
            let endPos = Math.min(
              ...[nextQuote, nextComma, nextBrace, nextBracket]
                .filter(pos => pos !== -1)
            );
            
            if (endPos === Infinity) {
              // No clear end found, assume it ends at the next quote
              endPos = afterMatch.indexOf('"');
            }
            
            if (endPos !== -1) {
              // Extract the string content and properly close it
              const stringContent = afterMatch.substring(0, endPos);
              const remaining = afterMatch.substring(endPos);
              
              fixed = beforeMatch + '"' + match[1] + stringContent + '"' + remaining;
              offset += stringContent.length + 2; // +2 for the quotes
            }
          }
        }
        
        return JSON.parse(fixed);
      },
      
      // Strategy 7: Aggressive repair for severely malformed JSON
      () => {
        let fixed = cleanedContent;
        
        // Replace single quotes with double quotes
        fixed = fixed.replace(/'/g, '"');
        
        // Fix common AI issues
        fixed = fixed.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
        fixed = fixed.replace(/:\s*"([^"]*)\s*$/gm, ':"$1"'); // Close incomplete strings
        fixed = fixed.replace(/:\s*"([^"]*)\s*([^"]*)"\s*([^"]*)/g, ':"$1$2$3"'); // Fix broken strings
        
        // Fix unescaped quotes in strings by finding and escaping them
        const stringMatches = fixed.match(/"([^"]*)"([^"]*)"([^"]*)"/g);
        if (stringMatches) {
          stringMatches.forEach(() => {
            // This regex replacement is handled by the previous strategies
          });
        }
        
        // Ensure proper object/array closure
        const openBraces = (fixed.match(/\{/g) || []).length;
        let closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        let closeBrackets = (fixed.match(/\]/g) || []).length;
        
        while (closeBraces < openBraces) {
          fixed += '}';
          closeBraces++;
        }
        while (closeBrackets < openBrackets) {
          fixed += ']';
          closeBrackets++;
        }
        
        return JSON.parse(fixed);
      },
      
      // Strategy 8: Complete truncated JSON responses
      () => {
        let fixed = cleanedContent;
        
        // Check if the response is truncated by looking for incomplete objects
        const incompleteObjectMatch = fixed.match(/"([^"]*)"\s*:\s*"([^"]*)$/);
        if (incompleteObjectMatch) {
          // Complete the incomplete string
          fixed += '"';
        }
        
        // Check for incomplete array items (like the one we saw in the logs)
        const incompleteArrayMatch = fixed.match(/,\s*\{\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*$/);
        if (incompleteArrayMatch) {
          // Complete the incomplete object
          fixed += '}';
        }
        
        // Check for the specific truncation pattern we saw
        if (fixed.includes('"position_y"') && !fixed.includes('"position_y":')) {
          // Find the last incomplete cell and complete it
          const lastCellMatch = fixed.match(/(\{[^}]*"position_x":\s*\d+,\s*"position_y":\s*)$/);
          if (lastCellMatch) {
            // Extract the matrix info to determine the missing value
            const matrixMatch = fixed.match(/"matrix_type":\s*"(\d+)x(\d+)"/);
            if (matrixMatch) {
              const dimensions = parseInt(matrixMatch[1]);
              const existingCells = (fixed.match(/\{/g) || []).length - 1; // Subtract 1 for the matrix object
              const expectedY = Math.floor(existingCells / dimensions) + 1;
              fixed += expectedY.toString();
            } else {
              fixed += '1'; // Default fallback
            }
          }
        }
        
        // Complete any incomplete arrays
        const openBraces = (fixed.match(/\{/g) || []).length;
        let closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        let closeBrackets = (fixed.match(/\]/g) || []).length;
        
        console.log('Strategy 8 bracket analysis:', {
          openBraces, closeBraces, openBrackets, closeBrackets
        });
        
        // Complete the JSON structure - add brackets first, then braces
        while (closeBrackets < openBrackets) {
          fixed += ']';
          closeBrackets++;
          console.log('Strategy 8: Added missing closing bracket ]');
        }
        while (closeBraces < openBraces) {
          fixed += '}';
          closeBraces++;
          console.log('Strategy 8: Added missing closing brace }');
        }
        
        // If we still have incomplete cells, generate the missing ones
        if (fixed.includes('"cells"') && !fixed.includes('"cells": []')) {
          const cellsMatch = fixed.match(/"cells":\s*\[([\s\S]*)\]/);
          if (cellsMatch) {
            const cellsContent = cellsMatch[1];
            const completedCells = completeCellsArray(cellsContent);
            fixed = fixed.replace(/"cells":\s*\[([\s\S]*)\]/, `"cells": [${completedCells}]`);
          }
        }
        
        return JSON.parse(fixed);
      },
      
      // Strategy 9: Fix missing closing brackets and braces
      () => {
        let fixed = cleanedContent;
        
        // Count all brackets and braces
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        console.log('Bracket analysis:', {
          openBraces, closeBraces, openBrackets, closeBrackets,
          missingBraces: openBraces - closeBraces,
          missingBrackets: openBrackets - closeBrackets
        });
        
        // Add missing closing brackets first (they're usually nested inside braces)
        while (closeBrackets < openBrackets) {
          fixed += ']';
          console.log('Added missing closing bracket ]');
        }
        
        // Add missing closing braces
        while (closeBraces < openBraces) {
          fixed += '}';
          console.log('Added missing closing brace }');
        }
        
        // Check for incomplete array items (missing closing bracket after last item)
        const lastArrayMatch = fixed.match(/,\s*\{\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*$/);
        if (lastArrayMatch) {
          fixed += '}';
          console.log('Added missing closing brace for incomplete array item');
        }
        
        return JSON.parse(fixed);
      },
      
      // Strategy 10: Advanced array completion for truncated responses
      () => {
        let fixed = cleanedContent;
        
        // Look for incomplete array items at the end
        const incompleteArrayItemRegex = /,\s*\{\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*$/;
        
        if (incompleteArrayItemRegex.test(fixed)) {
          console.log('Detected incomplete array item at end');
          
          // Find the last incomplete object and complete it
          const lastIncompleteMatch = fixed.match(/,\s*\{\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*(\d+)\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,\s*"([^"]*)"\s*:\s*"([^"]*)"\s*$/);
          
          if (lastIncompleteMatch) {
            // Complete the last object
            fixed += '}';
            console.log('Completed last incomplete object');
          }
        }
        
        // Count and fix brackets/braces
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        
        console.log('Strategy 10 bracket analysis:', {
          openBraces, closeBraces, openBrackets, closeBrackets
        });
        
        // Add missing closing brackets first
        while (closeBrackets < openBrackets) {
          fixed += ']';
          console.log('Strategy 10: Added missing closing bracket ]');
        }
        
        // Add missing closing braces
        while (closeBraces < openBraces) {
          fixed += '}';
          console.log('Strategy 10: Added missing closing brace }');
        }
        
        return JSON.parse(fixed);
      }
    ];

    let lastError: Error | null = null;
    
    for (let i = 0; i < parsingStrategies.length; i++) {
      try {
        const result = parsingStrategies[i]();
        console.log(`JSON parsing succeeded with strategy ${i + 1}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`JSON parsing strategy ${i + 1} failed:`, error);
        
        // If this is the first strategy (direct parsing), provide detailed validation info
        if (i === 0) {
          const validation = validateJSON(cleanedContent);
          if (!validation.isValid) {
            console.error("JSON validation failed:", validation.error);
            if (validation.position !== undefined) {
              const contextStart = Math.max(0, validation.position - 50);
              const contextEnd = Math.min(cleanedContent.length, validation.position + 50);
              console.error("Error context:", cleanedContent.substring(contextStart, contextEnd));
              console.error("Error position:", validation.position);
            }
          }
        }
        
        continue;
      }
    }
    
    // If all strategies fail, provide detailed debugging information
    console.error("All JSON parsing strategies failed. Raw content:", content);
    console.error("Content length:", content.length);
    console.error("First 500 characters:", content.substring(0, 500));
    console.error("Last 500 characters:", content.substring(Math.max(0, content.length - 500)));
    
    // Try to identify the specific issue
    const issues = [];
    if (content.includes("'")) {
      issues.push("Contains single quotes (should be double quotes)");
    }
    if (content.includes('\\"')) {
      issues.push("Contains escaped quotes");
    }
    if ((content.match(/"/g) || []).length % 2 !== 0) {
      issues.push("Unmatched quotes");
    }
    if (content.includes(',}') || content.includes(',]')) {
      issues.push("Contains trailing commas");
    }
    
    if (issues.length > 0) {
      console.error("Identified issues:", issues);
    }
    
    throw lastError || new Error("All JSON parsing strategies failed");
  };

  const generateFallbackMatrix = () => {
    try {
      // Determine matrix dimensions based on size
      const matrixDimensions = config.matrixSize === "3x3" ? 3 : 
                             config.matrixSize === "4x4" ? 4 : 5;
      
      const riskLevels = matrixDimensions === 3 ? ["low", "medium", "high"] :
                        matrixDimensions === 4 ? ["low", "medium", "high", "critical"] :
                        ["low", "medium", "high", "critical"];
      
      const controlLevels = matrixDimensions === 3 ? ["ineffective", "partially_effective", "effective"] :
                           matrixDimensions === 4 ? ["ineffective", "partially_effective", "effective", "highly_effective"] :
                           ["ineffective", "weak", "partially_effective", "effective", "highly_effective"];

      // Create basic matrix
      const matrix: RiskControlMatrix = {
        id: crypto.randomUUID(),
        name: `Basic Risk-Control Matrix for ${config.industry}`,
        description: `A ${config.matrixSize} matrix covering ${config.riskCategories.join(', ')} risks with ${config.controlFrameworks.join(', ')} frameworks`,
        matrix_type: config.matrixSize,
        risk_levels: riskLevels as RiskLevel[],
        control_effectiveness_levels: controlLevels as ControlEffectivenessLevel[],
        business_unit_id: businessUnitId || '',
        framework_id: undefined,
        created_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create cells
      const cells: MatrixCell[] = [];
      for (let x = 0; x < matrixDimensions; x++) {
        for (let y = 0; y < matrixDimensions; y++) {
          const riskLevel = riskLevels[x];
          const controlLevel = controlLevels[y];
          
          // Determine color based on risk and control levels
          let colorCode = '#FFA500'; // Default orange
          if (x <= 1 && y >= matrixDimensions - 2) {
            colorCode = '#10b981'; // Green for low risk, high effectiveness
          } else if (x >= matrixDimensions - 2 && y <= 1) {
            colorCode = '#ef4444'; // Red for high risk, low effectiveness
          } else if (x <= 1 && y <= 1) {
            colorCode = '#f59e0b'; // Yellow for low risk, low effectiveness
          }

          cells.push({
            id: crypto.randomUUID(),
            matrix_id: matrix.id,
            risk_level: riskLevel as RiskLevel,
            control_effectiveness: controlLevel as ControlEffectivenessLevel,
            position_x: x,
            position_y: y,
            color_code: colorCode,
            description: `${riskLevel} risk with ${controlLevel.toLowerCase()} controls`,
            action_required: x >= matrixDimensions - 2 ? 'Immediate action required' : 
                           y <= 1 ? 'Improve controls' : 'Monitor and review',
            created_at: new Date().toISOString()
          });
        }
      }

      onMatrixGenerated(matrix, cells);
      toast.success("Basic Risk-Control Matrix generated successfully!");
    } catch (error) {
      console.error("Error generating fallback matrix:", error);
      toast.error("Failed to generate fallback matrix");
    }
  };

  const handleGenerate = async () => {
    // Check if AI configuration exists
    if (!selectedAiConfig) {
      console.error("No AI configuration selected");
      toast.error("No AI configuration found. Please configure AI settings first.");
      if (onOpenAIConfig) {
        onOpenAIConfig();
      }
      return;
    }

    // Log the selected configuration for debugging
    console.log("Using AI configuration:", selectedAiConfig);

    // Validate AI configuration
    if (!selectedAiConfig.provider || !selectedAiConfig.model_name) {
      console.error("AI Configuration validation failed:", {
        provider: selectedAiConfig.provider,
        model_name: selectedAiConfig.model_name,
        config: selectedAiConfig
      });
      toast.error("Invalid AI configuration. Please check your AI settings.");
      if (onOpenAIConfig) {
        onOpenAIConfig();
      }
      return;
    }

    // Additional validation for provider
    if (selectedAiConfig.provider === 'undefined' || selectedAiConfig.provider === undefined) {
      console.error("AI provider is undefined:", selectedAiConfig);
      toast.error("AI provider is not configured. Please set up your AI configuration.");
      if (onOpenAIConfig) {
        onOpenAIConfig();
      }
      return;
    }

    try {
      setIsGenerating(true);
      const prompt = buildPrompt();

      const request = {
        provider: selectedAiConfig.provider,
        model: selectedAiConfig.model_name,
        prompt: prompt,
        context: `Generating risk-control matrix for ${config.industry} industry`,
        fieldType: "risk_control_matrix" as any,
        temperature: selectedAiConfig.temperature,
        maxTokens: selectedAiConfig.max_tokens,
        apiKey: selectedAiConfig.api_key,
        baseUrl: selectedAiConfig.api_endpoint,
        auditData: {
          title: `Risk-Control Matrix for ${config.industry}`,
          audit_type: "risk_assessment",
          business_unit: config.businessSize,
          scope: `Comprehensive risk-control matrix covering ${config.riskCategories.join(', ')} risks with ${config.controlFrameworks.join(', ')} frameworks`
        }
      };

      const response = await aiService.generateContent(request);

      // Debug logging
      console.log("AI Response received:", {
        success: response.success,
        contentLength: response.content?.length || 0,
        contentPreview: response.content?.substring(0, 200) + "...",
        error: response.error
      });

      if (response.success) {
        try {
          // Validate that we have content before parsing
          if (!response.content || typeof response.content !== 'string') {
            throw new Error("AI response is empty or invalid");
          }

          // Use the robust JSON parser
          const result = parseAIResponse(response.content);
          
          // Validate the expected structure
          if (!result.matrix || !result.cells || !Array.isArray(result.cells)) {
            throw new Error("AI response missing required matrix structure");
          }

          // Validate matrix object
          if (!result.matrix.name || !result.matrix.description) {
            throw new Error("AI response missing required matrix fields");
          }
          
          // Create matrix object
          const matrix: RiskControlMatrix = {
            id: crypto.randomUUID(),
            name: result.matrix.name,
            description: result.matrix.description,
            matrix_type: result.matrix.matrix_type || 'standard',
            risk_levels: result.matrix.risk_levels || ['Low', 'Medium', 'High'],
            control_effectiveness_levels: result.matrix.control_effectiveness_levels || ['Ineffective', 'Partially Effective', 'Effective'],
            business_unit_id: businessUnitId || '',
            framework_id: undefined,
            created_by: '', // Will be set by service
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Create cells with validation
          const cells: MatrixCell[] = result.cells.map((cell: any, index: number) => {
            // Validate required cell fields
            if (!cell.risk_level || !cell.control_effectiveness) {
              console.warn(`Cell ${index} missing required fields, using defaults`);
            }
            
            return {
              id: crypto.randomUUID(),
              matrix_id: matrix.id,
              risk_level: cell.risk_level || 'Medium',
              control_effectiveness: cell.control_effectiveness || 'Partially Effective',
              position_x: cell.position_x || index % 3,
              position_y: cell.position_y || Math.floor(index / 3),
              color_code: cell.color_code || '#FFA500',
              description: cell.description || 'Risk-control cell',
              action_required: cell.action_required || 'Monitor',
              created_at: new Date().toISOString()
            };
          });

          onMatrixGenerated(matrix, cells);
          toast.success("Risk-Control Matrix generated successfully!");
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          console.error("Raw AI response:", response.content);
          
          // Provide more specific error messages
          let errorMessage = "Failed to parse AI response. ";
          
          if (parseError instanceof Error) {
            if (parseError.message.includes("Unexpected EOF")) {
              errorMessage += "The AI response was incomplete. This may be due to token limits. Please try with a smaller configuration or increase the max tokens setting.";
            } else if (parseError.message.includes("Unterminated string")) {
              errorMessage += "The AI response contains malformed JSON with unescaped quotes or incomplete strings. This is a common AI generation issue.";
            } else if (parseError.message.includes("Expected ']'")) {
              errorMessage += "The AI response is missing closing brackets. This usually happens when the response is truncated. The system will attempt to fix this automatically.";
            } else if (parseError.message.includes("Expected '}'")) {
              errorMessage += "The AI response is missing closing braces. This usually happens when the response is truncated. The system will attempt to fix this automatically.";
            } else if (parseError.message.includes("not in JSON format")) {
              errorMessage += "The AI did not return valid JSON format. Please check your AI configuration and try again.";
            } else if (parseError.message.includes("missing required")) {
              errorMessage += "The AI response is missing required fields. Please try again.";
            } else if (parseError.message.includes("All JSON parsing strategies failed")) {
              errorMessage += "The AI response could not be parsed even after multiple repair attempts. The response may be severely malformed.";
            } else {
              errorMessage += `JSON parsing error: ${parseError.message}`;
            }
          }
          
          toast.error(errorMessage);
          
          // Suggest opening AI config for token limit issues
          if (parseError instanceof Error && parseError.message.includes("incomplete")) {
            if (onOpenAIConfig) {
              setTimeout(() => {
                if (confirm("Would you like to open AI configuration to increase token limits?")) {
                  onOpenAIConfig();
                }
              }, 1000);
            }
          }
          
          // Offer fallback generation for all parsing errors
          setTimeout(() => {
            if (confirm("Would you like to generate a basic matrix template instead?")) {
              generateFallbackMatrix();
            }
          }, 2000);
        }
      } else {
        // Provide more specific error messages
        let errorMessage = "Failed to generate matrix.";
        
        if (response.error) {
          if (response.error.includes("API key")) {
            errorMessage = "Invalid API key. Please check your AI configuration.";
          } else if (response.error.includes("not found") || response.error.includes("404")) {
            errorMessage = "AI model not found. Please check your model configuration.";
          } else if (response.error.includes("not running") || response.error.includes("localhost")) {
            errorMessage = "AI service not running. Please ensure your AI service is started.";
          } else {
            errorMessage = `AI generation failed: ${response.error}`;
          }
        }
        
        toast.error(errorMessage);
        
        // Suggest opening AI config for common issues
        if (response.error && (
          response.error.includes("API key") || 
          response.error.includes("not found") || 
          response.error.includes("not running")
        )) {
          if (onOpenAIConfig) {
            setTimeout(() => {
              if (confirm("Would you like to open AI configuration to fix this issue?")) {
                onOpenAIConfig();
              }
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error("Error generating matrix:", error);
      
      // Provide more helpful error messages
      let errorMessage = "Failed to generate matrix. Please check your AI configuration.";
      
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and AI service.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again or check your AI service.";
        } else {
          errorMessage = `Generation error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateConfig = (updates: Partial<GenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleRiskCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      riskCategories: prev.riskCategories.includes(category)
        ? prev.riskCategories.filter(c => c !== category)
        : [...prev.riskCategories, category]
    }));
  };

  const toggleControlFramework = (framework: string) => {
    setConfig(prev => ({
      ...prev,
      controlFrameworks: prev.controlFrameworks.includes(framework)
        ? prev.controlFrameworks.filter(f => f !== framework)
        : [...prev.controlFrameworks, framework]
    }));
  };

  // Check if AI is properly configured
  const isAIConfigured = selectedAiConfig && selectedAiConfig.provider && selectedAiConfig.model_name;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Matrix Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Configuration Status */}
          <div className={`p-4 rounded-lg border ${
            isAIConfigured 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {isAIConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {isAIConfigured ? 'AI Configuration Ready' : 'AI Configuration Required'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isAIConfigured 
                    ? `Using ${selectedAiConfig.provider} with ${selectedAiConfig.model_name}`
                    : 'Please configure AI settings to generate matrices'
                  }
                </p>
              </div>
              {!isAIConfigured && onOpenAIConfig && (
                <Button 
                  size="sm" 
                  onClick={onOpenAIConfig}
                  className="flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Configure AI
                </Button>
              )}
            </div>
          </div>

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={config.industry} onValueChange={(value) => updateConfig({ industry: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessSize">Business Size</Label>
              <Select value={config.businessSize} onValueChange={(value) => updateConfig({ businessSize: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="matrixSize">Matrix Size</Label>
              <Select value={config.matrixSize} onValueChange={(value: any) => updateConfig({ matrixSize: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x3">3x3</SelectItem>
                  <SelectItem value="4x4">4x4</SelectItem>
                  <SelectItem value="5x5">5x5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="generationFocus">Generation Focus</Label>
              <Select value={config.generationFocus} onValueChange={(value: any) => updateConfig({ generationFocus: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="focused">Focused</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Risk Categories */}
          <div>
            <Label>Risk Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {riskCategories.map(category => (
                <Badge
                  key={category}
                  variant={config.riskCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleRiskCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Control Frameworks */}
          <div>
            <Label>Control Frameworks</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {controlFrameworks.map(framework => (
                <Badge
                  key={framework}
                  variant={config.controlFrameworks.includes(framework) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleControlFramework(framework)}
                >
                  {framework}
                </Badge>
              ))}
            </div>
          </div>

          {/* Existing Data Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeExistingRisks"
                checked={config.includeExistingRisks}
                onChange={(e) => updateConfig({ includeExistingRisks: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="includeExistingRisks">
                Include Existing Risks ({existingRisks.length})
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeExistingControls"
                checked={config.includeExistingControls}
                onChange={(e) => updateConfig({ includeExistingControls: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="includeExistingControls">
                Include Existing Controls ({existingControls.length})
              </Label>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Add any specific requirements or custom instructions..."
                    value={config.customPrompt || ""}
                    onChange={(e) => updateConfig({ customPrompt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>AI Configuration</Label>
                  <Select 
                    value={selectedAiConfig?.id || ""} 
                    onValueChange={(value) => {
                      const config = aiConfigurations.find(c => c.id === value);
                      setSelectedAiConfig(config || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI configuration" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiConfigurations.map(config => (
                        <SelectItem key={config.id || 'default'} value={config.id || 'default'}>
                          {`${config.provider} - ${config.model_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {aiConfigurations.length === 0 && onOpenAIConfig && (
                    <div className="mt-2 text-sm text-gray-600">
                      No AI configurations found.{" "}
                      <button 
                        onClick={onOpenAIConfig}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Configure AI settings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !isAIConfigured}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Matrix...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Risk-Control Matrix
              </>
            )}
          </Button>

          {/* Help Text */}
          {!isAIConfigured && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">AI Configuration Required</p>
                  <p className="mb-2">
                    To generate risk-control matrices using AI, you need to configure an AI provider first. 
                    Supported providers include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mb-2">
                    <li><strong>Ollama:</strong> Local AI models (recommended for privacy)</li>
                    <li><strong>OpenAI:</strong> GPT models via API</li>
                    <li><strong>Claude:</strong> Anthropic's AI models</li>
                    <li><strong>Gemini:</strong> Google's AI models</li>
                  </ul>
                  {onOpenAIConfig && (
                    <Button 
                      size="sm" 
                      onClick={onOpenAIConfig}
                      className="mt-2"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure AI Settings
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Generation Summary</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>• Matrix Size: {config.matrixSize}</div>
              <div>• Risk Categories: {config.riskCategories.length} selected</div>
              <div>• Control Frameworks: {config.controlFrameworks.length} selected</div>
              <div>• Existing Risks: {config.includeExistingRisks ? `${existingRisks.length} included` : 'Not included'}</div>
              <div>• Existing Controls: {config.includeExistingControls ? `${existingControls.length} included` : 'Not included'}</div>
              {isAIConfigured && (
                <div>• AI Provider: {selectedAiConfig.provider} ({selectedAiConfig.model_name})</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMatrixGenerator;
