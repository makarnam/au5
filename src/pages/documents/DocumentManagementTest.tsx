import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { documentManagementService } from "../../services/documentManagementService";

const DocumentManagementTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCategories = async () => {
    try {
      addResult("Testing categories...");
      const categories = await documentManagementService.getCategories();
      addResult(`Categories loaded: ${categories.length} items`);
      console.log('Categories:', categories);
    } catch (error) {
      addResult(`Error loading categories: ${error}`);
      console.error('Categories error:', error);
    }
  };

  const testTags = async () => {
    try {
      addResult("Testing tags...");
      const tags = await documentManagementService.getTags();
      addResult(`Tags loaded: ${tags.length} items`);
      console.log('Tags:', tags);
    } catch (error) {
      addResult(`Error loading tags: ${error}`);
      console.error('Tags error:', error);
    }
  };

  const testStats = async () => {
    try {
      addResult("Testing stats...");
      const stats = await documentManagementService.getDashboardStats();
      addResult(`Stats loaded: ${JSON.stringify(stats)}`);
      console.log('Stats:', stats);
    } catch (error) {
      addResult(`Error loading stats: ${error}`);
      console.error('Stats error:', error);
    }
  };

  const testSearch = async () => {
    try {
      addResult("Testing search...");
      const searchResult = await documentManagementService.searchDocuments({}, 1, 10);
      addResult(`Search results: ${searchResult.documents.length} documents`);
      console.log('Search results:', searchResult);
    } catch (error) {
      addResult(`Error searching documents: ${error}`);
      console.error('Search error:', error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult("Starting Document Management Service Tests...");
    
    await testCategories();
    await testTags();
    await testStats();
    await testSearch();
    
    addResult("All tests completed!");
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Document Management Service Test</h1>
        <p className="text-muted-foreground">
          This page tests the document management service to identify any issues.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={runAllTests} disabled={loading}>
              {loading ? "Running Tests..." : "Run All Tests"}
            </Button>
            <Button onClick={testCategories} variant="outline">
              Test Categories
            </Button>
            <Button onClick={testTags} variant="outline">
              Test Tags
            </Button>
            <Button onClick={testStats} variant="outline">
              Test Stats
            </Button>
            <Button onClick={testSearch} variant="outline">
              Test Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No tests run yet. Click "Run All Tests" to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagementTest;
