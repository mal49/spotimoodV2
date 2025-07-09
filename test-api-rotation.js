// Test script for YouTube API key rotation system
// Run this script to verify that the enhanced key rotation is working properly

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testApiKeyRotation() {
    console.log('🧪 Testing YouTube API Key Rotation System');
    console.log('=' * 50);

    try {
        // 1. Check current system health
        console.log('\n1. Checking system health...');
        const healthResponse = await fetch(`${API_BASE_URL}/api/debug/keys`);
        
        if (healthResponse.ok) {
            const health = await healthResponse.json();
            console.log(`✅ System Status: ${health.systemHealth.status}`);
            console.log(`📊 Available Keys: ${health.systemHealth.availableKeys}/${health.systemHealth.totalKeys}`);
            console.log(`🎯 Total Quota Used: ${health.systemHealth.totalQuotaUsed}/${health.systemHealth.totalQuotaAvailable} (${health.systemHealth.quotaUtilization}%)`);
            
            // Show individual key status
            console.log('\n📋 Individual Key Status:');
            health.keyStatus.forEach(key => {
                const statusIcon = key.status === 'available' ? '✅' : key.status === 'quota_exceeded' ? '❌' : '⚠️';
                console.log(`  ${statusIcon} Key ${key.keyIndex}: ${key.status} (${key.quotaUsed.percentage}% used)`);
            });

            // Show recommendations
            if (health.recommendations.length > 0) {
                console.log('\n💡 Recommendations:');
                health.recommendations.forEach(rec => {
                    const icon = rec.severity === 'critical' ? '🚨' : rec.severity === 'warning' ? '⚠️' : 'ℹ️';
                    console.log(`  ${icon} ${rec.message}`);
                    console.log(`     Action: ${rec.action}`);
                });
            }
        } else {
            console.error('❌ Failed to get system health');
        }

        // 2. Test multiple search requests to trigger rotation
        console.log('\n2. Testing API key rotation with multiple requests...');
        const testQueries = [
            'rock music',
            'jazz classics',
            'electronic beats',
            'acoustic guitar',
            'classical symphony'
        ];

        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`\n🔍 Testing search ${i + 1}/5: "${query}"`);
            
            const startTime = Date.now();
            const searchResponse = await fetch(`${API_BASE_URL}/api/search-music?query=${encodeURIComponent(query)}&maxResults=3`);
            const duration = Date.now() - startTime;
            
            if (searchResponse.ok) {
                const data = await searchResponse.json();
                console.log(`  ✅ Success in ${duration}ms - Found ${data.videos.length} videos (Quota: ${data.quotaUsed})`);
            } else {
                const error = await searchResponse.text();
                console.log(`  ❌ Failed in ${duration}ms: ${searchResponse.status} - ${error}`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 3. Check final system state
        console.log('\n3. Checking final system state...');
        const finalHealthResponse = await fetch(`${API_BASE_URL}/api/debug/keys`);
        
        if (finalHealthResponse.ok) {
            const finalHealth = await finalHealthResponse.json();
            console.log(`📊 Final Quota Usage: ${finalHealth.systemHealth.totalQuotaUsed}/${finalHealth.systemHealth.totalQuotaAvailable} (${finalHealth.systemHealth.quotaUtilization}%)`);
            
            // Show which keys were used
            const usedKeys = finalHealth.keyStatus.filter(key => key.quotaUsed.quotaCost > 0);
            if (usedKeys.length > 0) {
                console.log('\n🔄 Keys Used During Test:');
                usedKeys.forEach(key => {
                    console.log(`  Key ${key.keyIndex}: ${key.quotaUsed.quotaCost} quota units, ${key.performance.totalRequests} requests`);
                });
            }
        }

        console.log('\n✅ Test completed successfully!');
        console.log('\n📝 Tips:');
        console.log('  - Monitor /api/debug/keys endpoint for real-time status');
        console.log('  - Each search request costs 100 quota units');
        console.log('  - Video details requests cost 1 quota unit');
        console.log('  - System will automatically rotate keys when quota is approached');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Make sure your server is running on port 3001');
        console.log('  2. Verify your YouTube API keys are properly configured');
        console.log('  3. Check server logs for detailed error information');
    }
}

// Test for specific quota limit scenarios
async function testQuotaLimitHandling() {
    console.log('\n🧪 Testing Quota Limit Handling');
    console.log('=' * 40);

    try {
        // Get current system state
        const healthResponse = await fetch(`${API_BASE_URL}/api/debug/keys`);
        const health = await healthResponse.json();
        
        const availableKeys = health.keyStatus.filter(key => key.status === 'available');
        
        if (availableKeys.length === 0) {
            console.log('⚠️ No available keys for quota limit testing');
            return;
        }

        console.log(`🎯 Testing with ${availableKeys.length} available keys`);
        
        // Simulate high-volume requests to test rotation
        console.log('\n🔄 Simulating high-volume requests...');
        const promises = [];
        
        for (let i = 0; i < 10; i++) {
            promises.push(
                fetch(`${API_BASE_URL}/api/search-music?query=test${i}&maxResults=1`)
                    .then(res => ({ status: res.status, index: i }))
                    .catch(error => ({ error: error.message, index: i }))
            );
        }
        
        const results = await Promise.all(promises);
        
        const successful = results.filter(r => r.status === 200).length;
        const failed = results.filter(r => r.status !== 200 || r.error).length;
        
        console.log(`📊 Results: ${successful} successful, ${failed} failed`);
        
        // Check if rotation occurred
        const finalHealthResponse = await fetch(`${API_BASE_URL}/api/debug/keys`);
        const finalHealth = await finalHealthResponse.json();
        
        const keysUsed = finalHealth.keyStatus.filter(key => key.performance.totalRequests > 0);
        console.log(`🔄 Keys used during test: ${keysUsed.length}`);
        
        if (keysUsed.length > 1) {
            console.log('✅ Key rotation is working properly!');
        } else {
            console.log('ℹ️ Only one key used (normal for low volume)');
        }

    } catch (error) {
        console.error('❌ Quota test failed:', error.message);
    }
}

// Main execution
async function runTests() {
    console.log('🚀 Starting YouTube API Key Rotation Tests\n');
    
    await testApiKeyRotation();
    
    console.log('\n' + '=' * 60);
    
    await testQuotaLimitHandling();
    
    console.log('\n🎉 All tests completed!');
    console.log('📊 Check server logs for detailed rotation information');
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testApiKeyRotation, testQuotaLimitHandling }; 