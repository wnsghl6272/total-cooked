const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });

async function initializeHeroPool() {
  try {
    console.log('🎨 Initializing Hero Image Pool...');
    console.log('📍 Server URL:', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    
    const serverUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${serverUrl}/api/hero-pool?action=initialize`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
      console.log('📊 Image Count:', result.imageCount);
      console.log('🕐 Last Updated:', result.lastUpdated);
    } else {
      console.error('❌ Failed to initialize hero pool:', result.error);
    }
  } catch (error) {
    console.error('❌ Error initializing hero pool:', error.message);
    process.exit(1);
  }
}

async function checkHeroPoolStatus() {
  try {
    console.log('🔍 Checking Hero Image Pool Status...');
    
    const serverUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${serverUrl}/api/hero-pool?action=status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📊 Pool Status:');
    console.log('  - Exists:', result.exists);
    console.log('  - Image Count:', result.imageCount);
    console.log('  - Current Index:', result.currentIndex);
    console.log('  - Last Updated:', result.lastUpdated);
    console.log('  - Needs Refresh:', result.needsRefresh);
    
    return result;
  } catch (error) {
    console.error('❌ Error checking hero pool status:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Hero Image Pool Management Script');
  console.log('=====================================\n');

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('💡 Please add your OpenAI API key to .env.local');
    process.exit(1);
  }

  const action = process.argv[2] || 'status';
  
  switch (action) {
    case 'init':
    case 'initialize':
      await initializeHeroPool();
      break;
      
    case 'status':
      await checkHeroPoolStatus();
      break;
      
    case 'refresh':
      console.log('🔄 Refreshing Hero Image Pool...');
      try {
        const serverUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${serverUrl}/api/hero-pool?action=refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Success:', result.message);
          console.log('📊 Image Count:', result.imageCount);
          console.log('🕐 Last Updated:', result.lastUpdated);
        } else {
          console.error('❌ Failed to refresh hero pool:', result.error);
        }
      } catch (error) {
        console.error('❌ Error refreshing hero pool:', error.message);
      }
      break;
      
    default:
      console.log('📖 Available commands:');
      console.log('  - status: Check current pool status');
      console.log('  - init: Initialize hero image pool');
      console.log('  - refresh: Refresh all hero images');
      console.log('\n💡 Usage: node scripts/initialize-hero-pool.js [command]');
  }
}

if (require.main === module) {
  main().catch(console.error);
} 