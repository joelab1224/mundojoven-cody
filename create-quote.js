// Create a quote for the given flight option
const axios = require('axios');

const API_BASE_URL = 'https://fuv-back-qa.mundojoven.com/fuv_core_api';
const USERNAME = 'sintheria@mundojoven.com';
const PASSWORD = 'fuv';

async function createQuote() {
  try {
    console.log('🔐 Authenticating with MundoJoven API...');
    
    // Step 1: Login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: USERNAME,
      password: PASSWORD
    });

    const { TOKEN, TOKEN_PREFIX } = loginResponse.data;
    console.log('✅ Authentication successful');

    // Step 2: Get customer data
    console.log('🔍 Getting customer data...');
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

    const customerData = customerResponse.data.data[0]; // Use first customer
    console.log('✅ Customer data retrieved:', customerData.fullName);

    const client = {
      email: customerEmail,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      mothersName: customerData.mothersName,
      gender: customerData.gender.code
    };

    // Flight Option 1 Details
    const flightOption1 = {
      price: 7513.65,
      currency: 'MXN',
      segments: [
        {
          origin: 'MEX',
          destination: 'JFK',
          departureDate: '2025-10-18T07:15:00-6.0',
          arrivalDate: '2025-10-18T14:00:00-4.0',
          flightTime: '285',
          subRoutes: [
            { origin: 'MEX', destination: 'JFK' }
          ]
        },
        {
          origin: 'JFK',
          destination: 'MEX',
          departureDate: '2025-10-23T08:30:00-4.0',
          arrivalDate: '2025-10-23T21:35:00-6.0',
          flightTime: '905',
          subRoutes: [
            { origin: 'JFK', destination: 'IAH' },
            { origin: 'IAH', destination: 'MEX' }
          ]
        }
      ]
    };

    // Step 3: Create quote
    console.log('🔄 Creating quote...');

    const quoteRequest = {
      client: client,
      customer: customerData,
      postalCode: '86179',
      formAdvertising: {
        id: 5,
        dateCreated: "2019-02-21T03:11:36.000+0000",
        lastUpdated: "2019-02-21T03:11:36.000+0000",
        version: 0,
        code: "",
        description: "Correo electronico",
        required: false
      },
      contactFormClient: {
        id: 6,
        dateCreated: "2019-02-21T03:11:36.000+0000",
        lastUpdated: "2019-02-21T03:11:36.000+0000",
        version: 0,
        code: "",
        description: "Facebook"
      }
    };

    const newQuoteResponse = await axios.post(
      `${API_BASE_URL}/quote/newQuote`,
      quoteRequest,
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quoteNumber = newQuoteResponse.data.data.number;
    console.log('✅ Quote created:', quoteNumber);

    // Flight route information
    const route = {
      departureIATA: 'MEX',
      departureDescription: 'Aeropuerto Internacional Benito Juárez',
      arrivalIATA: 'JFK',
      arrivalDescription: 'John F. Kennedy International Airport',
      departureDate: '2025-10-18T06:30:00.000+0000',
      departureDateString: '',
      arrivalDate: '2025-10-23T06:30:00.000+0000',
      arrivalDateString: ''
    };

    // Prepare product addition request
    const productRequest = {
      tipoVueloEnum: 'REDONDO',
      flexSearch: false,
      lastTicketDate: '2025-10-20',
      validatingCarrier: 'AA',
      fareData: {
        total: flightOption1.price,
        baseFare: 6513.65,
        tax: 1000,
        equivFare: 0,
        aditionalFee: 0,
        revenue: 0,
        serviceCharge: 350,
        commission: 0,
        commissionPercentage: 0,
        price: flightOption1.price,
        providerPrice: flightOption1.price,
        currency: { type: flightOption1.currency }
      },
      productType: {
        typeProduct: 'Air',
        description: 'Aéreo'
      },
      route: route,
      insuranceCancelationExits: true,
      promo: false,
      seatsRemaining: null,
      europeanFlight: false,
      accountCode: null,
      internationalFlight: true,
      visaEUA: false,
      visaCAN: false,
      pnrManual: null,
      ticketNumber: [],
      stayDays: 0,
      realType: '',
      type: '',
      locatorList: [],
      selected: false,
      savedPassenger: false,
      emit: false,
      priority: '',
      itineraries: [flightOption1],
      passengerDataList: []
    };

    console.log('🔄 Adding product to quote...');
    await axios.post(
      `${API_BASE_URL}/quote/addProductSelectedAir/${quoteNumber}`,
      productRequest,
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Product added to quote');

    // Accept products in the quote
    console.log('🔄 Accepting products in quote...');
    await axios.post(
      `${API_BASE_URL}/quote/addProductList/${quoteNumber}`,
      {},
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Products accepted');

    // Change quote step to complete
    console.log('🔄 Changing quote step...');
    await axios.put(
      `${API_BASE_URL}/quote/${quoteNumber}/changeStep?step=4`,
      {},
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Quote step changed');

    // Fetch final quote details
    const finalQuoteResponse = await axios.post(
      `${API_BASE_URL}/quote/findByNumber/${quoteNumber}`,
      {},
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📝 Final quote details:', finalQuoteResponse.data.data);
    return finalQuoteResponse.data.data;

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

// Run the quote creation
createQuote()
  .then(() => {
    console.log('\n🎉 Quote creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Quote creation failed!');
    process.exit(1);
  });

