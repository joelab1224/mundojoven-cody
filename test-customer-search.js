// Simple Node.js script to test customer search
const axios = require('axios');

const API_BASE_URL = 'https://fuv-back-qa.mundojoven.com/fuv_core_api';
const USERNAME = 'sintheria@mundojoven.com';
const PASSWORD = 'fuv';

async function testCustomerSearch() {
  try {
    console.log('🔐 Authenticating with MundoJoven API...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: USERNAME,
      password: PASSWORD
    });

    const { TOKEN, TOKEN_PREFIX } = loginResponse.data;
    console.log('✅ Authentication successful');
    console.log('📋 User:', loginResponse.data.USER_NAME);
    console.log('🏢 Branch:', loginResponse.data.BRANCH);

    // Step 2: Search for customer
    console.log('\n🔍 Searching for customer: javier.ocana@mother.travel');
    
    const customerEmail = 'javier.ocana@mother.travel';
    const customerResponse = await axios.get(
      `${API_BASE_URL}/customercrm/findCustomer/${encodeURIComponent(customerEmail)}`,
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Customer search completed');
    console.log('📊 API Status:', customerResponse.data.status);
    console.log('📝 HTTP Status:', customerResponse.data.httpStatus);
    console.log('👥 Customers found:', customerResponse.data.data.length);

    // Display customer details
    if (customerResponse.data.data.length > 0) {
      customerResponse.data.data.forEach((customer, index) => {
        console.log(`\n👤 Customer ${index + 1}:`);
        console.log('   ID:', customer.id);
        console.log('   Name:', `${customer.firstName} ${customer.lastName} ${customer.mothersName}`.trim());
        console.log('   Full Name:', customer.fullName);
        console.log('   Birth Date:', customer.birthDate);
        console.log('   Gender:', customer.gender?.description || 'N/A');
        console.log('   Intelisis ID:', customer.idIntelisis);
        console.log('   Account ID:', customer.idAccount);
        console.log('   User Owner:', customer.idUserOwner);
        
        // Email addresses
        if (customer.emails && customer.emails.length > 0) {
          console.log('   📧 Emails:');
          customer.emails.forEach(email => {
            console.log(`      ${email.emailAddress} (${email.active ? 'Active' : 'Inactive'})`);
          });
        }
        
        // Phone numbers
        if (customer.phones && customer.phones.length > 0) {
          console.log('   📱 Phones:');
          customer.phones.forEach(phone => {
            console.log(`      ${phone.number} (${phone.type}) - ${phone.active ? 'Active' : 'Inactive'}`);
          });
        }

        // Contact type
        if (customer.typeContact) {
          console.log('   🏷️ Contact Type:', customer.typeContact.description);
        }

        console.log('   📅 Created:', new Date(customer.dateCreated).toLocaleString());
        if (customer.lastUpdated) {
          console.log('   🔄 Last Updated:', new Date(customer.lastUpdated).toLocaleString());
        }
      });
    } else {
      console.log('❌ No customers found with this email address');
    }

    // Display currency rates from login response
    if (loginResponse.data.CURRENCY_SABRE && loginResponse.data.CURRENCY_SABRE.length > 0) {
      console.log('\n💱 Current Exchange Rates (SABRE):');
      loginResponse.data.CURRENCY_SABRE.forEach(rate => {
        console.log(`   ${rate.currency}: ${rate.rate} ${rate.countryCode} (${rate.rateDate})`);
      });
    }

    if (loginResponse.data.CURRENCY_INTELISIS) {
      console.log('\n💱 Current Exchange Rates (INTELISIS):');
      const intel = loginResponse.data.CURRENCY_INTELISIS;
      console.log(`   USD: ${intel.USDExchangeRate}`);
      console.log(`   EUR: ${intel.EURExchangeRate}`);
      console.log(`   MXN: ${intel.MXNExchangeRate}`);
    }

    return customerResponse.data;

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Status Text:', error.response.statusText);
      console.error('💬 Response:', error.response.data);
    } else if (error.request) {
      console.error('📡 Network Error:', error.message);
    } else {
      console.error('⚙️ Error:', error.message);
    }
    throw error;
  }
}

// Run the test
testCustomerSearch()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed!');
    process.exit(1);
  });
