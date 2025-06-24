// Create a quote for the flight option using the correct API structure
const axios = require('axios');

const API_BASE_URL = 'https://fuv-back-qa.mundojoven.com/fuv_core_api';
const USERNAME = 'sintheria@mundojoven.com';
const PASSWORD = 'fuv';

async function createQuoteWithCorrectStructure() {
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

    // Step 3: Search for flights to get the actual flight data
    console.log('🔍 Searching for flights to get flight data...');
    
    const flightSearchRequest = {
      flightType: 'REDONDO',
      fhDeperture: '18-10-2025',
      fhComback: '23-10-2025',
      adults: 1,
      childs: 0,
      infants: 0,
      ageChilds: [],
      ageEnfants: [],
      cabinPref: 'Economy',
      country: 'mexico',
      destination: 'JFK',
      origin: 'MEX',
      maxStops: 3,
      sender: `fuv/${USERNAME}`,
      studentFare: false,
      pedido: '',
      fecha_salida: '',
      clave: '',
      codigo_aerolinea: '',
      ruta: '',
      utilidad: '',
      tarifa_base: '',
      total_impuestos: '',
      xo: '',
      xd: '',
      pasajero: '',
      num_boleto: ''
    };

    const flightsResponse = await axios.post(
      `${API_BASE_URL}/air/flights/getOTAFlights`,
      flightSearchRequest,
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const selectedFlight = flightsResponse.data.data[0]; // Select first flight option
    console.log('✅ Flight data retrieved, price:', selectedFlight.price.total);

    // Step 4: Create quote
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

    // Step 5: Prepare product addition request using the correct structure
    const productRequest = {
      tipoVueloEnum: 'REDONDO',
      flexSearch: false,
      lastTicketDate: selectedFlight.ticketTimeLimit,
      validatingCarrier: selectedFlight.validatingCarrier,
      fareData: {
        total: selectedFlight.price.total,
        baseFare: selectedFlight.price.baseFare,
        tax: selectedFlight.price.tax,
        equivFare: 0,
        aditionalFee: 0,
        revenue: selectedFlight.price.revenue,
        serviceCharge: selectedFlight.price.serviceCharge,
        commission: 0,
        commissionPercentage: 0,
        price: 0,
        providerPrice: 0,
        currency: {
          type: selectedFlight.currency
        }
      },
      productType: {
        typeProduct: 'Air',
        description: 'Aéreo'
      },
      route: {
        departureIATA: 'MEX',
        departureDescription: 'Aeropuerto Internacional Benito Juárez',
        arrivalIATA: 'JFK',
        arrivalDescription: 'John F. Kennedy International Airport',
        departureDate: '2025-10-18T06:30:00.000+0000',
        departureDateString: '',
        arrivalDate: '2025-10-23T06:30:00.000+0000',
        arrivalDateString: ''
      },
      insuranceCancelationExits: selectedFlight.insuranceCancelationExits,
      promo: selectedFlight.promo,
      seatsRemaining: selectedFlight.seatsRemaining,
      europeanFlight: selectedFlight.europeanFlight,
      accountCode: selectedFlight.accountCode,
      internationalFlight: selectedFlight.internationalFlight,
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
      itineraries: [selectedFlight],
      passengerDataList: []
    };

    // Add passenger data using the structure from the API documentation
    selectedFlight.price.passengerPrices.forEach(passengerPrice => {
      productRequest.passengerDataList.push({
        age: 0,
        birthday: null,
        fareData: {
          aditionalFee: 0,
          baseFare: passengerPrice.baseFare,
          commission: 0,
          commissionPercentage: 0,
          currency: {
            type: selectedFlight.currency
          },
          equivFare: 0,
          price: 0,
          providerPrice: 0,
          revenue: passengerPrice.revenue,
          serviceCharge: passengerPrice.serviceCharge,
          tax: passengerPrice.tax,
          total: passengerPrice.total
        },
        gender: '',
        id: '',
        lastName: '',
        mail: '',
        mothersName: '',
        name: '',
        passengerCode: {
          accountCode: passengerPrice.accountCode,
          promo: selectedFlight.promo,
          realType: passengerPrice.passengerType,
          type: passengerPrice.passengerType
        },
        phone: ''
      });
    });

    console.log('🔄 Adding product to quote...');
    const addProductResponse = await axios.post(
      `${API_BASE_URL}/quote/addProductSelectedAir/${quoteNumber}`,
      productRequest,
      {
        headers: {
          'Authorization': `${TOKEN_PREFIX}${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Product added to quote successfully');

    // Step 6: Accept products in the quote
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

    // Step 7: Change quote step to complete
    console.log('🔄 Changing quote step to 4...');
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

    // Step 8: Fetch final quote details
    console.log('🔄 Fetching final quote details...');
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

    console.log('\n📋 QUOTE SUMMARY:');
    console.log('📄 Quote Number:', quoteNumber);
    console.log('👤 Customer:', customerData.fullName);
    console.log('✈️ Route: MEX → JFK');
    console.log('📅 Departure:', '2025-10-18');
    console.log('📅 Return:', '2025-10-23');
    console.log('💰 Total Price:', selectedFlight.price.total, selectedFlight.currency);
    console.log('🎯 Quote Status: Completed');

    return {
      quoteNumber,
      customer: customerData,
      flight: selectedFlight,
      finalQuote: finalQuoteResponse.data.data
    };

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

// Run the quote creation
createQuoteWithCorrectStructure()
  .then(() => {
    console.log('\n🎉 Quote creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Quote creation failed!');
    process.exit(1);
  });
