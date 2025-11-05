// Test Supabase Realtime Connection
// Run this in your browser console on the admin dashboard

async function testRealtimeConnection() {
  console.log('🔍 Testing Supabase Realtime Connection...\n');

  // Test 1: Check Supabase client
  console.log('1️⃣ Checking Supabase Client...');
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase client not found. Make sure the app is running.');
    return;
  }
  console.log('✅ Supabase client found\n');

  // Test 2: Check environment variables
  console.log('2️⃣ Checking Environment Variables...');
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ Supabase credentials missing in .env file');
    return;
  }
  console.log('✅ Supabase URL:', url);
  console.log('✅ Anon Key:', key.substring(0, 20) + '...\n');

  // Test 3: Check database connection
  console.log('3️⃣ Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('transactions').select('count');
    if (error) throw error;
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Test 4: Test Realtime subscription
  console.log('4️⃣ Testing Realtime Subscription...');
  let realtimeConnected = false;

  const testChannel = supabase
    .channel('test-connection')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'transactions'
    }, (payload) => {
      console.log('🎉 REALTIME UPDATE RECEIVED:', payload);
    })
    .subscribe((status) => {
      console.log('📡 Realtime status:', status);
      
      if (status === 'SUBSCRIBED') {
        realtimeConnected = true;
        console.log('✅ Realtime connected successfully!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Open Supabase Dashboard');
        console.log('   2. Go to Table Editor → transactions');
        console.log('   3. Insert a new row');
        console.log('   4. Watch this console for real-time updates!\n');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection failed');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Go to Supabase → Database → Replication');
        console.log('   2. Enable replication for "transactions" table');
        console.log('   3. Refresh this page and try again\n');
      }
    });

  // Cleanup function
  window.cleanupRealtimeTest = () => {
    supabase.removeChannel(testChannel);
    console.log('🧹 Test channel cleaned up');
  };

  console.log('⏳ Waiting for realtime connection...');
  console.log('   (Run "cleanupRealtimeTest()" when done)\n');
}

// Run the test
testRealtimeConnection();
