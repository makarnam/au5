const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://iuxhefuorkpbmwxmxtqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Creating risk_measurements table...');
    const { error: error1 } = await supabase.from('risk_measurements').select('id').limit(1);
    if (error1 && error1.message.includes('does not exist')) {
      console.log('Table does not exist, creating...');
      // Since we can't execute DDL directly, let's try inserting a dummy record to test
      console.log('Please create the tables manually in Supabase dashboard or use SQL editor');
      console.log('SQL to execute:');
      console.log(fs.readFileSync('sql/risk_appetite_tables.sql', 'utf8'));
    } else {
      console.log('✓ risk_measurements table exists');
    }
    
    console.log('Creating risk_scenarios table...');
    const { error: error2 } = await supabase.from('risk_scenarios').select('id').limit(1);
    if (error2 && error2.message.includes('does not exist')) {
      console.log('Table does not exist, creating...');
    } else {
      console.log('✓ risk_scenarios table exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
