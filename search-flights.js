// Simple Node.js script to search for flights from Mexico City to New York
const axios = require('axios');

const API_BASE_URL = 'https://fuv-back-qa.mundojoven.com/fuv_core_api';
const USERNAME = 'sintheria@mundojoven.com';
const PASSWORD = 'fuv';

async function searchFlights() {
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

    // Step 2: Search for flights
    console.log('\n🔍 Searching for flights from MEX to JFK...');
    
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

    console.log('✅ Flight search completed');
    console.log('📊 API Status:', flightsResponse.data.status);
    console.log('📝 HTTP Status:', flightsResponse.status);
    console.log('✈️ Flights found:', flightsResponse.data.data.length);

    // Display flight details
    flightsResponse.data.data.slice(0, 5).forEach((flight, index) => {
      console.log(`\n✈️ Flight Option ${index + 1}:`);
      console.log('  Price:', flight.price.total, flight.price.currency);
      flight.segments.forEach((segment, segIndex) => {
        console.log(`  Segment ${segIndex + 1}:`);
        segment.routes.forEach(route => {
          console.log(`    Route from ${route.origin} to ${route.destination}`);
          console.log(`    Departure: ${route.departureDate}`);
          console.log(`    Arrival: ${route.arrivalDate}`);
          console.log(`    Flight Time: ${route.flightTime}`);
          console.log('    Sub-routes:');
          route.subRoutes.forEach(subRoute => {
            console.log('      ', `${subRoute.origin} to ${subRoute.destination}`);
          });
        });
      });
    });

    return flightsResponse.data;

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

// Run the flight search
searchFlights()
  .then(() => {
    console.log('\n🎉 Flight search completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Flight search failed!');
    process.exit(1);
  });

