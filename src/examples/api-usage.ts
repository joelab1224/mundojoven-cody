import {
  AuthService,
  CustomerService,
  FlightService,
  QuoteService,
  Customer,
  FlightOption,
  Quote
} from '@/services';

/**
 * Example: Complete flight booking workflow
 */
export async function completeFlightBookingExample() {
  try {
    // Step 1: Authenticate (automatically handled by API client)
    console.log('Authenticating...');
    const authResult = await AuthService.login();
    console.log('Authentication successful:', authResult.USER_NAME);

    // Step 2: Search for customer
    console.log('Searching for customer...');
    const customerEmail = 'javier.ocana@mother.travel';
    const customers = await CustomerService.findCustomerByEmail(customerEmail);
    
    if (customers.length === 0) {
      throw new Error('Customer not found');
    }
    
    const selectedCustomer = customers[0];
    console.log('Customer found:', CustomerService.formatCustomerName(selectedCustomer));

    // Step 3: Search for flights
    console.log('Searching for flights...');
    const flightSearchRequest = FlightService.createFlightSearchRequest({
      flightType: 'REDONDO',
      origin: 'MEX',
      destination: 'MAD',
      departureDate: '18-10-2025',
      returnDate: '23-10-2025',
      adults: 1,
      userEmail: customerEmail
    });

    const flights = await FlightService.searchFlights(flightSearchRequest);
    console.log(`Found ${flights.length} flights`);

    if (flights.length === 0) {
      throw new Error('No flights found');
    }

    // Step 4: Select cheapest flight
    const sortedFlights = FlightService.sortFlightsByPrice(flights);
    const selectedFlight = sortedFlights[0];
    console.log('Selected flight price:', FlightService.formatPrice(selectedFlight.price.total));

    // Step 5: Create client data from customer
    const client = {
      email: CustomerService.getPrimaryEmail(selectedCustomer) || customerEmail,
      firstName: selectedCustomer.firstName,
      lastName: selectedCustomer.lastName,
      mothersName: selectedCustomer.mothersName,
      gender: selectedCustomer.gender.code
    };

    // Step 6: Create route information
    const route = {
      departureIATA: 'MEX',
      departureDescription: 'Aeropuerto Internacional Benito Juárez',
      arrivalIATA: 'MAD',
      arrivalDescription: 'Aeropuerto Madrid-Barajas',
      departureDate: '2025-10-18T06:30:00.000+0000',
      departureDateString: '',
      arrivalDate: '2025-10-23T06:30:00.000+0000',
      arrivalDateString: ''
    };

    // Step 7: Create complete quote
    console.log('Creating quote...');
    const quote = await QuoteService.createCompleteQuote(
      client,
      selectedCustomer,
      selectedFlight,
      {
        flightType: 'REDONDO',
        route
      }
    );

    console.log('Quote created successfully:', quote.number);
    console.log('Quote name:', QuoteService.formatQuoteName(quote));

    return {
      quote,
      customer: selectedCustomer,
      flight: selectedFlight,
      client
    };

  } catch (error) {
    console.error('Flight booking workflow failed:', error);
    throw error;
  }
}

/**
 * Example: Search customers
 */
export async function searchCustomersExample() {
  try {
    const email = 'javier.ocana@mother.travel';
    const customers = await CustomerService.findCustomerByEmail(email);
    
    console.log(`Found ${customers.length} customers`);
    
    customers.forEach((customer, index) => {
      console.log(`Customer ${index + 1}:`);
      console.log('  Name:', CustomerService.formatCustomerName(customer));
      console.log('  Email:', CustomerService.getPrimaryEmail(customer));
      console.log('  Phone:', CustomerService.getPrimaryPhone(customer));
      console.log('  ID:', customer.id);
    });

    return customers;
  } catch (error) {
    console.error('Customer search failed:', error);
    throw error;
  }
}

/**
 * Example: Search flights with filters
 */
export async function searchFlightsExample() {
  try {
    const searchRequest = FlightService.createFlightSearchRequest({
      flightType: 'REDONDO',
      origin: 'MEX',
      destination: 'MAD',
      departureDate: '18-10-2025',
      returnDate: '23-10-2025',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'Economy',
      userEmail: 'test@example.com'
    });

    const flights = await FlightService.searchFlights(searchRequest);
    
    console.log(`Found ${flights.length} flights`);
    
    // Apply filters
    const maxPrice = 20000; // MXN
    const maxStops = 1;
    
    const filteredFlights = FlightService.filterFlightsByMaxStops(
      FlightService.filterFlightsByMaxPrice(flights, maxPrice),
      maxStops
    );
    
    console.log(`${filteredFlights.length} flights after filtering`);
    
    // Sort by price
    const sortedFlights = FlightService.sortFlightsByPrice(filteredFlights);
    
    sortedFlights.slice(0, 5).forEach((flight, index) => {
      console.log(`Flight ${index + 1}:`);
      console.log('  Price:', FlightService.formatPrice(flight.price.total));
      console.log('  Duration:', FlightService.getTotalFlightTime(flight));
      console.log('  Stops:', FlightService.getFlightStops(flight));
      console.log('  Airline:', flight.validatingCarrier);
      console.log('  Visa required:', FlightService.requiresVisa(flight));
    });

    return sortedFlights;
  } catch (error) {
    console.error('Flight search failed:', error);
    throw error;
  }
}

/**
 * Example: Create quote step by step
 */
export async function createQuoteStepByStepExample() {
  try {
    // Get customer
    const customers = await CustomerService.findCustomerByEmail('javier.ocana@mother.travel');
    const customer = customers[0];

    // Create client data
    const client = {
      email: 'javier.ocana@mother.travel',
      firstName: 'JAVIER',
      lastName: 'OCANA',
      mothersName: 'BLANCO',
      gender: 'M'
    };

    // Step 1: Create quote
    const quoteRequest = QuoteService.createQuoteRequest(client, customer);
    const quote = await QuoteService.createNewQuote(quoteRequest);
    console.log('Quote created:', quote.number);

    // Step 2: Get flights and select one
    const searchRequest = FlightService.createFlightSearchRequest({
      flightType: 'REDONDO',
      origin: 'MEX',
      destination: 'MAD',
      departureDate: '18-10-2025',
      returnDate: '23-10-2025',
      adults: 1,
      userEmail: 'javier.ocana@mother.travel'
    });

    const flights = await FlightService.searchFlights(searchRequest);
    const selectedFlight = flights[0];

    // Step 3: Add product to quote
    const route = {
      departureIATA: 'MEX',
      departureDescription: 'Aeropuerto Internacional Benito Juárez',
      arrivalIATA: 'MAD',
      arrivalDescription: 'Aeropuerto Madrid-Barajas',
      departureDate: '2025-10-18T06:30:00.000+0000',
      departureDateString: '',
      arrivalDate: '2025-10-23T06:30:00.000+0000',
      arrivalDateString: ''
    };

    const productRequest = QuoteService.createAddProductRequest(selectedFlight, {
      flightType: 'REDONDO',
      route
    });

    await QuoteService.addFlightProductToQuote(quote.number, productRequest);
    console.log('Product added to quote');

    // Step 4: Accept products
    await QuoteService.acceptProducts(quote.number);
    console.log('Products accepted');

    // Step 5: Change quote step
    await QuoteService.changeQuoteStep(quote.number, 4);
    console.log('Quote step changed to 4');

    // Step 6: Get final quote
    const finalQuote = await QuoteService.getQuoteByNumber(quote.number);
    console.log('Final quote:', QuoteService.formatQuoteName(finalQuote));

    return finalQuote;
  } catch (error) {
    console.error('Quote creation failed:', error);
    throw error;
  }
}

/**
 * Example: Get airports list
 */
export async function getAirportsExample() {
  try {
    const airports = await FlightService.getAirports();
    console.log(`Loaded ${airports.length} airports`);
    
    // Show first 10 airports
    airports.slice(0, 10).forEach(airport => {
      console.log(`${airport.iata} - ${airport.name} (${airport.city}, ${airport.country})`);
    });

    return airports;
  } catch (error) {
    console.error('Failed to load airports:', error);
    throw error;
  }
}
