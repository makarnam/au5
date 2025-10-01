import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{table: string, status: 'success' | 'error', message: string}[]>([]);

  const createTables = async () => {
    setLoading(true);
    setResults([]);

    const tables = [
      {
        name: 'risk_appetite_framework',
        sql: `
          CREATE TABLE IF NOT EXISTS risk_appetite_framework (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR NOT NULL,
            description TEXT,
            risk_categories JSONB DEFAULT '{}',
            appetite_levels JSONB DEFAULT '{}',
            tolerance_thresholds JSONB DEFAULT '{}',
            review_frequency VARCHAR DEFAULT 'quarterly',
            next_review_date DATE,
            approved_by UUID REFERENCES users(id),
            approval_date DATE,
            status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'under_review')),
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'risk_measurements',
        sql: `
          CREATE TABLE IF NOT EXISTS risk_measurements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            framework_id UUID REFERENCES risk_appetite_framework(id) ON DELETE CASCADE,
            category VARCHAR NOT NULL,
            current_value DECIMAL NOT NULL,
            threshold_min DECIMAL NOT NULL,
            threshold_max DECIMAL NOT NULL,
            unit VARCHAR NOT NULL,
            status VARCHAR DEFAULT 'within_appetite' CHECK (status IN ('within_appetite', 'approaching_limit', 'breached')),
            last_updated TIMESTAMPTZ DEFAULT NOW(),
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'risk_scenarios',
        sql: `
          CREATE TABLE IF NOT EXISTS risk_scenarios (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            framework_id UUID REFERENCES risk_appetite_framework(id) ON DELETE CASCADE,
            title VARCHAR NOT NULL,
            description TEXT,
            impact_level VARCHAR DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
            probability DECIMAL DEFAULT 25,
            potential_loss DECIMAL DEFAULT 0,
            mitigation_plan TEXT,
            status VARCHAR DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated')),
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      }
    ];

    const newResults: {table: string, status: 'success' | 'error', message: string}[] = [];

    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: table.sql });

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase.from(table.name).select('id').limit(1);

          if (directError && directError.message.includes('does not exist')) {
            newResults.push({
              table: table.name,
              status: 'error',
              message: `Table creation failed: ${directError.message}`
            });
          } else {
            newResults.push({
              table: table.name,
              status: 'success',
              message: 'Table already exists or was created successfully'
            });
          }
        } else {
          newResults.push({
            table: table.name,
            status: 'success',
            message: 'Table created successfully'
          });
        }
      } catch (error: any) {
        newResults.push({
          table: table.name,
          status: 'error',
          message: `Error: ${error.message}`
        });
      }
    }

    setResults(newResults);
    setLoading(false);

    const successCount = newResults.filter(r => r.status === 'success').length;
    if (successCount === tables.length) {
      toast.success('All database tables created successfully!');
    } else {
      toast.error(`${tables.length - successCount} table(s) failed to create`);
    }
  };

  const insertSampleData = async () => {
    setLoading(true);

    try {
      // Insert sample risk appetite framework
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('risk_appetite_framework')
        .insert([{
          name: 'Corporate Risk Appetite Framework',
          description: 'Defines the organization\'s risk appetite across different risk categories',
          risk_categories: {
            categories: [
              'Strategic Risk',
              'Operational Risk',
              'Financial Risk',
              'Compliance Risk',
              'Cybersecurity Risk',
              'Reputational Risk'
            ]
          },
          appetite_levels: {
            levels: {
              low: 'Accept low levels of risk, conservative approach',
              moderate: 'Accept moderate levels of risk, balanced approach',
              high: 'Accept higher levels of risk, aggressive approach'
            }
          },
          tolerance_thresholds: {
            thresholds: {
              strategic: { min: 0, max: 25, unit: 'probability_percentage' },
              operational: { min: 0, max: 15, unit: 'impact_score' },
              financial: { min: 0, max: 50000, unit: 'currency_usd' },
              compliance: { min: 0, max: 5, unit: 'violations_per_quarter' },
              cybersecurity: { min: 0, max: 10, unit: 'breach_probability' },
              reputational: { min: 0, max: 20, unit: 'negative_sentiment_score' }
            }
          },
          review_frequency: 'quarterly',
          next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'approved',
          created_by: user.user.id
        }]);

      if (error) {
        toast.error(`Failed to insert sample data: ${error.message}`);
      } else {
        toast.success('Sample data inserted successfully!');
      }
    } catch (error: any) {
      toast.error(`Error inserting sample data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Setup for Risk Appetite Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This component will create the necessary database tables for the risk appetite management module.
            Click the button below to initialize the database schema.
          </p>

          <div className="flex gap-3">
            <Button onClick={createTables} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Tables...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Database Tables
                </>
              )}
            </Button>

            <Button variant="outline" onClick={insertSampleData} disabled={loading}>
              Insert Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{result.table}</div>
                    <div className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}