import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugkykgxawxyasgidljmr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3lrZ3hhd3h5YXNnaWRsam1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzU1MzUsImV4cCI6MjA3NjIxMTUzNX0.lBhoFw3RXfQRWmPJ_VkIofDTqoN3DsCVnW38yp75bnw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('profiles').select('count');

    if (error) {
      console.error('❌ Error connecting to database:');
      console.error(error.message);

      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n⚠️  The database schema has not been applied!');
        console.log('Please run the SQL from supabase-schema.sql in your Supabase SQL Editor.');
        console.log('\nSteps:');
        console.log('1. Go to https://supabase.com/dashboard/project/ugkykgxawxyasgidljmr');
        console.log('2. Click "SQL Editor" in the left menu');
        console.log('3. Click "New Query"');
        console.log('4. Copy the entire contents of supabase-schema.sql');
        console.log('5. Paste and click "Run"');
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Database schema is applied correctly.');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
