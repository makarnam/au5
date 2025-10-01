import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://iuxhefuorkpbmwxmxtqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Creating risk_measurements table...');
    
    // Try to create the table by attempting to insert a dummy record
    // This will fail if the table doesn't exist, but will tell us if it does
    const { error: testError } = await supabase
      .from('risk_measurements')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('does not exist')) {
      console.log('Table does not exist. Please create it manually in Supabase SQL Editor with:');
      const sql = fs.readFileSync('sql/risk_appetite_tables.sql', 'utf8');
      console.log('\n' + '='.repeat(50));
      console.log('SQL TO EXECUTE:');
      console.log('='.repeat(50));
      console.log(sql);
      console.log('='.repeat(50));
    } else {
      console.log('✓ risk_measurements table already exists');
    }
    
    console.log('Creating risk_scenarios table...');
    const { error: testError2 } = await supabase
      .from('risk_scenarios')
      .select('id')
      .limit(1);
    
    if (testError2 && testError2.message.includes('does not exist')) {
      console.log('Table does not exist - use the SQL above');
    } else {
      console.log('✓ risk_scenarios table already exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
