const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://iuxhefuorkpbmwxmxtqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGhlZnVvcmtwYm13eG14dHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTMxMDMsImV4cCI6MjA2OTI2OTEwM30.q3fnuQF_Yt5U6cKLn3DQ0AeOpmkalspddvqXdnlSxS4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('sql/compliance_framework_management.sql', 'utf8');
    
    console.log('Executing SQL...');
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing statement...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error('Error executing statement:', error);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('Tables creation process completed');
  } catch (err) {
    console.error('Error:', err);
  }
}

createTables();
