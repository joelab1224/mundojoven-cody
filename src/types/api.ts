// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  TOKEN: string;
  TOKEN_PREFIX: string;
  EXPIRATION_TIME: number;
  USER_NAME: string;
  USER_ROLE: { authority: string }[];
  CURRENCY_SABRE: CurrencyRate[];
  CURRENCY_INTELISIS: {
    EURExchangeRate: number;
    USDExchangeRate: number;
    MXNExchangeRate: number;
    source: string;
  };
  BRANCH: number;
  BRANCH_REGIONAL: any;
}

export interface CurrencyRate {
  idEchangeRate: number;
  countryCode: string;
  currency: string;
  rate: number;
  rateDate: string;
}

// Customer Types
export interface Customer {
  id: string;
  dateCreated: string;
  lastUpdated: string | null;
  idAccount: string;
  idUserOwner: string;
  idIntelisis: string;
  firstName: string;
  lastName: string;
  mothersName: string;
  fullName: string;
  dateOfBirth: string;
  birthDate: string;
  gender: {
    id: string | null;
    dateCreated: string | null;
    lastUpdated: string | null;
    version: number | null;
    code: string;
    description: string;
  };
  typeContact: {
    id: string | null;
    dateCreated: string;
    lastUpdated: string;
    version: number;
    description: string;
  };
  emails: {
    id: string | null;
    dateCreated: string | null;
    lastUpdated: string | null;
    version: number | null;
    emailAddress: string;
    active: boolean;
  }[];
  phones: {
    id: string | null;
    dateCreated: string | null;
    lastUpdated: string | null;
    version: number | null;
    number: string;
    type: string;
    active: boolean;
    blipIdentity: string | null;
  }[];
  billingInformations: any[];
  exchangeRateInformations: any[];
  interestsForExpo: any;
  insights: any;
  nationality: any;
  passportNumber: any;
  address: any;
  americanVisa: any;
  actualActivity: any;
}

export interface CustomerSearchResponse {
  status: boolean;
  message: string;
  data: Customer[];
  httpStatus: string;
}

// Flight Types
export interface FlightSearchRequest {
  pedido: string;
  fecha_salida: string;
  clave: string;
  codigo_aerolinea: string;
  ruta: string;
  utilidad: string;
  tarifa_base: string;
  total_impuestos: string;
  xo: string;
  xd: string;
  pasajero: string;
  num_boleto: string;
  flightType: "SENCILLO" | "REDONDO" | "OPENJAW";
  fhDeperture: string;
  fhComback?: string;
  adults: number;
  childs: number;
  infants: number;
  ageChilds: number[];
  ageEnfants: number[];
  cabinPref: string;
  country: string;
  destination: string;
  origin: string;
  maxStops: number;
  sender: string;
  studentFare: boolean;
  airlineCode?: string;
  destinationOJ?: string;
  flexFares?: boolean;
  originOJ?: string;
  passengerCode?: string;
}

export interface SubRoute {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  flightNumber: string;
  flightTime: string;
  terminalOrigin: string | null;
  terminalDestination: string | null;
  baggage: string[];
  meals: string[];
  bookingClass: string;
  key: string;
  airline: string;
  equipment: string;
  group: string;
  operatingAirline: string;
  seats: number;
  fareBasis: string[];
}

export interface Route {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  flightTime: string;
  providerCode: string;
  subRoutes: SubRoute[];
}

export interface FlightSegment {
  id: string;
  key: string;
  origin: string;
  destination: string;
  routes: Route[];
}

export interface PassengerPrice {
  total: number;
  baseFare: number;
  tax: number;
  serviceCharge: number;
  revenue: number;
  passengerType: string;
  accountCode: string;
  fee: any;
}

export interface FlightPrice {
  total: number;
  baseFare: number;
  tax: number;
  serviceCharge: number;
  revenue: number;
  passengerPrices: PassengerPrice[];
  fee: any;
}

export interface FlightOption {
  fareType: string;
  bookingClass: any;
  ticketTimeLimit: string;
  validatingCarrier: string;
  accountCode: any;
  gdsType: string;
  currency: string;
  promo: boolean;
  europeanFlight: boolean;
  internationalFlight: boolean;
  insuranceCancelationExits: boolean;
  insuranceCancelationValue: number;
  seatsRemaining: any;
  segments: FlightSegment[];
  price: FlightPrice;
  requieredVisa: boolean;
}

export interface FlightSearchResponse {
  status: boolean;
  message: string;
  data: FlightOption[];
  httpStatus: string;
}

// Quote Types
export interface Client {
  email: string;
  firstName: string;
  lastName: string;
  mothersName: string;
  gender: string;
}

export interface FormAdvertising {
  id: number;
  dateCreated: string;
  lastUpdated: string;
  version: number;
  code: string;
  description: string;
  required: boolean;
}

export interface ContactFormClient {
  id: number;
  dateCreated: string;
  lastUpdated: string;
  version: number;
  code: string;
  description: string;
}

export interface NewQuoteRequest {
  client: Client;
  customer: Customer;
  quoteCampaign: any;
  postalCode: string;
  formAdvertising: FormAdvertising;
  contactFormClient: ContactFormClient;
}

export interface Quote {
  id: string;
  dateCreated: string;
  lastUpdated: string;
  number: string;
  name: string;
}

export interface NewQuoteResponse {
  status: boolean;
  message: string;
  data: Quote;
  httpStatus: string;
}

// Add Product Types
export interface RouteInfo {
  departureIATA: string;
  departureDescription: string;
  arrivalIATA: string;
  arrivalDescription: string;
  departureDate: string;
  departureDateString: string;
  arrivalDate: string;
  arrivalDateString: string;
}

export interface ProductType {
  typeProduct: string;
  description: string;
}

export interface FareData {
  total: number;
  baseFare: number;
  tax: number;
  equivFare: number;
  aditionalFee: number;
  revenue: number;
  serviceCharge: number;
  commission: number;
  commissionPercentage: number;
  price: number;
  providerPrice: number;
  currency: { type: string };
}

export interface PassengerData {
  age: number;
  birthday: string | null;
  fareData: FareData;
  gender: string;
  id: string;
  lastName: string;
  mail: string;
  mothersName: string;
  name: string;
  passengerCode: {
    accountCode: string;
    promo: boolean;
    realType: string;
    type: string;
  };
  phone: string;
}

export interface AddProductRequest {
  tipoVueloEnum: string;
  flexSearch: boolean;
  lastTicketDate: string;
  validatingCarrier: string;
  fareData: FareData;
  productType: ProductType;
  route: RouteInfo;
  insuranceCancelationExits: boolean;
  promo: boolean;
  seatsRemaining: any;
  europeanFlight: boolean;
  accountCode: any;
  internationalFlight: boolean;
  visaEUA: boolean;
  visaCAN: boolean;
  pnrManual: any;
  ticketNumber: any[];
  stayDays: number;
  realType: string;
  type: string;
  locatorList: any[];
  selected: boolean;
  savedPassenger: boolean;
  emit: boolean;
  priority: string;
  itineraries: FlightOption[];
  passengerDataList: PassengerData[];
}

// Airport Types
export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  httpStatus: string;
}
