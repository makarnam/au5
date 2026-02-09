import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Terminal,
  Download,
  Play,
  Settings,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService } from "../../services/aiService";

interface DiagnosticResult {
  isRunning: boolean;
  availableModels: string[];
  error?: string;
}

interface OllamaDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl?: string;
}

export default function OllamaDiagnostic({
  isOpen,
  onClose,
  baseUrl = "http://localhost:11434",
}: OllamaDiagnosticProps) {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [customUrl, setCustomUrl] = useState(baseUrl);

  const runDiagnostic = async () => {
    setIsChecking(true);
    try {
      const result = await aiService.checkOllamaStatus(customUrl);
      setDiagnostic(result);
    } catch (error) {
      setDiagnostic({
        isRunning: false,
        availableModels: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const recommendedModels = [
    { name: "llama2", size: "3.8GB", description: "Best overall quality" },
    { name: "mistral", size: "4.1GB", description: "Fast and efficient" },
    { name: "phi", size: "1.6GB", description: "Lightweight option" },
    { name: "codellama", size: "3.8GB", description: "Good for technical audits" },
  ];

  const installCommands = {
    macos: "brew install ollama",
    linux: "curl -fsSL https://ollama.ai/install.sh | sh",
    windows: "Download from https://ollama.ai",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Terminal className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Ollama Diagnostic Tool
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* URL Configuration */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ollama Base URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://localhost:11434"
            />
            <button
              onClick={runDiagnostic}
              disabled={isChecking}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Check
            </button>
          </div>
        </div>

        {/* Diagnostic Results */}
        {diagnostic && (
          <div className="mb-6">
            <div
              className={`p-4 rounded-lg border-l-4 ${
                diagnostic.isRunning
                  ? "bg-green-50 border-green-400"
                  : "bg-red-50 border-red-400"
              }`}
            >
              <div className="flex items-center">
                {diagnostic.isRunning ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <h3 className="font-medium">
                  {diagnostic.isRunning
                    ? "Ollama is running successfully!"
                    : "Ollama is not accessible"}
                </h3>
              </div>
              {diagnostic.error && (
                <p className="mt-2 text-sm text-red-600">{diagnostic.error}</p>
              )}
            </div>

            {/* Available Models */}
            {diagnostic.isRunning && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Available Models ({diagnostic.availableModels.length})
                </h4>
                {diagnostic.availableModels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {diagnostic.availableModels.map((model) => (
                      <div
                        key={model}
                        className="flex items-center justify-between bg-white p-2 rounded border"
                      >
                        <span className="text-sm font-mono">{model}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    No models downloaded. See installation guide below.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Installation Guide */}
        <div className="space-y-6">
          {/* Step 1: Install Ollama */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                1
              </span>
              Install Ollama
            </h3>
            <div className="space-y-3">
              {Object.entries(installCommands).map(([os, command]) => (
                <div key={os} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium capitalize">{os}: </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {command}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(command)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit ollama.ai for detailed instructions
            </a>
          </div>

          {/* Step 2: Start Ollama */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                2
              </span>
              Start Ollama Service
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  ollama serve
                </code>
                <button
                  onClick={() => copyToClipboard("ollama serve")}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                This starts Ollama on http://localhost:11434
              </p>
            </div>
          </div>

          {/* Step 3: Download Models */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                3
              </span>
              Download Models
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Recommended models for audit descriptions:
              </p>
              {recommendedModels.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-600">
                      {model.description} • {model.size}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(`ollama pull ${model.name}`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <code className="bg-white px-2 py-1 rounded text-sm border">
                      ollama pull {model.name}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Test Connection */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                4
              </span>
              Test Connection
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  curl http://localhost:11434/api/tags
                </code>
                <button
                  onClick={() =>
                    copyToClipboard("curl http://localhost:11434/api/tags")
                  }
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                This should return a JSON list of available models
              </p>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Common Issues</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Port 11434 is already in use: Kill existing process or use different port</li>
            <li>• Permission denied: Run with proper permissions or fix ~/.ollama ownership</li>
            <li>• Model not found: Download the model using "ollama pull model-name"</li>
            <li>• Connection refused: Make sure Ollama service is running</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <a
            href="https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Official Troubleshooting
          </a>
          <div className="space-x-3">
            <button
              onClick={runDiagnostic}
              disabled={isChecking}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isChecking ? "Checking..." : "Run Diagnostic Again"}
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
