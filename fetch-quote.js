// Fetch a specific quote using the API
const axios = require('axios');

const API_BASE_URL = 'https://fuv-back-qa.mundojoven.com/fuv_core_api';
const USERNAME = 'sintheria@mundojoven.com';
const PASSWORD = 'fuv';

async function fetchQuote() {
  try {
    console.log('🔐 Authenticating with MundoJoven API...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: USERNAME,
      password: PASSWORD
    });

    const { TOKEN, TOKEN_PREFIX } = loginResponse.data;
    console.log('✅ Authentication successful');

    // Step 2: Fetch quote
    const quoteNumber = 'CALL551';
    console.log(`🔍 Fetching quote for number: ${quoteNumber}...`);
    const response = await axios.post(
      `${API_BASE_URL}/quote/findByNumber/${quoteNumber}`,
      {},
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data) {
      console.log('✅ Quote retrieved successfully');
      console.log('✏️ Quote Details:', JSON.stringify(response.data.data, null, 2));
    } else {
      console.log('❌ Failed to retrieve quote details');
    }

    return response.data.data;

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Status Text:', error.response.statusText);
      console.error('💬 Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 Network Error:', error.message);
    } else {
      console.error('⚙️ Error:', error.message);
    }
    throw error;
  }
}

// Run the quote fetch
fetchQuote()
  .then((quote) => {
    console.log('\n🎉 Quote fetched successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Quote fetch failed!');
    process.exit(1);
  });

