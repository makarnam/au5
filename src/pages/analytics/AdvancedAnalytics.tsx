import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Brain,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import PredictiveAnalytics from "../../components/analytics/PredictiveAnalytics";
import TrendAnalysis from "../../components/analytics/TrendAnalysis";
import BenchmarkingDashboard from "../../components/analytics/BenchmarkingDashboard";
import AdvancedAnalyticsDashboard from "../../components/analytics/AdvancedAnalyticsDashboard";

const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics & Reporting</h1>
          <p className="text-gray-600">
            Unlock powerful insights from your audit, risk, and compliance data with AI-driven analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictive Analytics
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-1">New</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trend Analysis
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-1">New</span>
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Benchmarking
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-1">New</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysis />
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <BenchmarkingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
