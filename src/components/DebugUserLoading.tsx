import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userManagementService } from '../services/userManagementService';
import { userManagementServiceDebug } from '../services/userManagementService-debug';
import { userManagementServiceFixed } from '../services/userManagementService-fixed';
import { userManagementServiceFixed2 } from '../services/userManagementService-fixed2';
import { userManagementServiceFixed3 } from '../services/userManagementService-fixed3';

const DebugUserLoading: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDebugTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Check authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.authState = {
        hasSession: !!session,
        userId: session?.user?.id,
        error: sessionError?.message
      };

      // Test 2: Direct Supabase query
      const { data: directData, error: directError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      results.directQuery = {
        success: !directError,
        dataCount: directData?.length || 0,
        error: directError?.message,
        firstUser: directData?.[0]
      };

      // Test 3: Simple service method
      try {
        const simpleResult = await userManagementServiceDebug.getUsersSimple();
        results.simpleServiceQuery = {
          success: true,
          dataCount: simpleResult.users?.length || 0,
          total: simpleResult.total,
          firstUser: simpleResult.users?.[0]
        };
      } catch (simpleError: any) {
        results.simpleServiceQuery = {
          success: false,
          error: simpleError?.message || 'Unknown error'
        };
      }

      // Test 4: Service method with join
      try {
        const joinResult = await userManagementServiceDebug.getUsersWithJoin();
        results.joinServiceQuery = {
          success: true,
          dataCount: joinResult.users?.length || 0,
          total: joinResult.total,
          firstUser: joinResult.users?.[0]
        };
      } catch (joinError: any) {
        results.joinServiceQuery = {
          success: false,
          error: joinError?.message || 'Unknown error'
        };
      }

      // Test 5: Fixed service method
      try {
        const fixedResult = await userManagementServiceFixed.getUsers({
          page: 1,
          page_size: 5
        });
        results.fixedServiceQuery = {
          success: true,
          dataCount: fixedResult.users?.length || 0,
          total: fixedResult.total,
          firstUser: fixedResult.users?.[0]
        };
      } catch (fixedError: any) {
        results.fixedServiceQuery = {
          success: false,
          error: fixedError?.message || 'Unknown error'
        };
      }

      // Test 6: Fixed service simple method
      try {
        const fixedSimpleResult = await userManagementServiceFixed.getUsersSimple({
          page: 1,
          page_size: 5
        });
        results.fixedSimpleServiceQuery = {
          success: true,
          dataCount: fixedSimpleResult.users?.length || 0,
          total: fixedSimpleResult.total,
          firstUser: fixedSimpleResult.users?.[0]
        };
      } catch (fixedSimpleError: any) {
        results.fixedSimpleServiceQuery = {
          success: false,
          error: fixedSimpleError?.message || 'Unknown error'
        };
      }

      // Test 7: Fixed3 service method (no search)
      try {
        const fixed3Result = await userManagementServiceFixed3.getUsersNoSearch({
          page: 1,
          page_size: 5
        });
        results.fixed3ServiceQuery = {
          success: true,
          dataCount: fixed3Result.users?.length || 0,
          total: fixed3Result.total,
          firstUser: fixed3Result.users?.[0]
        };
      } catch (fixed3Error: any) {
        results.fixed3ServiceQuery = {
          success: false,
          error: fixed3Error?.message || 'Unknown error'
        };
      }

      // Test 8: Fixed2 service method (no search)
      try {
        const fixed2Result = await userManagementServiceFixed2.getUsersNoSearch({
          page: 1,
          page_size: 5
        });
        results.fixed2ServiceQuery = {
          success: true,
          dataCount: fixed2Result.users?.length || 0,
          total: fixed2Result.total,
          firstUser: fixed2Result.users?.[0]
        };
      } catch (fixed2Error: any) {
        results.fixed2ServiceQuery = {
          success: false,
          error: fixed2Error?.message || 'Unknown error'
        };
      }

      // Test 9: Original service method
      try {
        const serviceResult = await userManagementService.getUsers({
          page: 1,
          page_size: 5
        });
        results.originalServiceQuery = {
          success: true,
          dataCount: serviceResult.users?.length || 0,
          total: serviceResult.total,
          firstUser: serviceResult.users?.[0]
        };
      } catch (serviceError: any) {
        results.originalServiceQuery = {
          success: false,
          error: serviceError?.message || 'Unknown error'
        };
      }

      // Test 10: Check RLS policies
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('get_rls_policies', { table_name: 'users' })
        .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));
      
      results.rlsPolicies = {
        success: !rlsError,
        data: rlsData,
        error: rlsError?.message
      };

    } catch (error: any) {
      results.generalError = error?.message;
    }

    setDebugInfo(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Debug User Loading</h2>
      
      <button
        onClick={runDebugTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Debug Results:</h3>
          
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-900 mb-2">{key}:</h4>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugUserLoading;
