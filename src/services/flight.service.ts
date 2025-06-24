import apiClient from '@/lib/api-client';
import { 
  FlightSearchRequest, 
  FlightSearchResponse, 
  FlightOption, 
  Airport,
  ApiResponse
} from '@/types/api';

export class FlightService {
  /**
   * Get list of available airports
   */
  static async getAirports(): Promise<Airport[]> {
    try {
      const response = await apiClient.get<ApiResponse<Airport[]>>('/air/flights/airports');
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to fetch airports');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch airports:', error);
      throw new Error('Failed to load airports');
    }
  }

  /**
   * Search for flights
   */
  static async searchFlights(searchParams: FlightSearchRequest): Promise<FlightOption[]> {
    try {
      // Ensure required fields are set with defaults
      const request: FlightSearchRequest = {
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
        num_boleto: '',
        ageChilds: [],
        ageEnfants: [],
        airlineCode: '',
        cabinPref: 'Economy',
        destinationOJ: '',
        flexFares: false,
        originOJ: '',
        passengerCode: '',
        ...searchParams,
      };

      const response = await apiClient.post<FlightSearchResponse>(
        '/air/flights/getOTAFlights',
        request
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Flight search failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Flight search failed:', error);
      throw new Error('Failed to search for flights');
    }
  }

  /**
   * Create flight search request with common defaults
   */
  static createFlightSearchRequest(params: {
    flightType: 'SENCILLO' | 'REDONDO' | 'OPENJAW';
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    cabinClass?: string;
    userEmail: string;
  }): FlightSearchRequest {
    return {
      flightType: params.flightType,
      fhDeperture: params.departureDate,
      fhComback: params.returnDate || '',
      adults: params.adults,
      childs: params.children || 0,
      infants: params.infants || 0,
      ageChilds: [],
      ageEnfants: [],
      cabinPref: params.cabinClass || 'Economy',
      country: 'mexico',
      destination: params.destination,
      origin: params.origin,
      maxStops: 3,
      sender: `fuv/${params.userEmail}`,
      studentFare: false,
      airlineCode: '',
      destinationOJ: '',
      flexFares: false,
      originOJ: '',
      passengerCode: '',
      // Additional required fields from API
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
      num_boleto: '',
    };
  }

  /**
   * Format flight duration from minutes
   */
  static formatFlightDuration(minutes: string | number): string {
    const totalMinutes = typeof minutes === 'string' ? parseInt(minutes) : minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Format price for display
   */
  static formatPrice(amount: number, currency: string = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Check if flight requires visa
   */
  static requiresVisa(flight: FlightOption): boolean {
    return flight.requieredVisa;
  }

  /**
   * Get flight stops information
   */
  static getFlightStops(flight: FlightOption): number {
    const outboundSegment = flight.segments[0];
    if (!outboundSegment || !outboundSegment.routes[0]) return 0;
    
    return outboundSegment.routes[0].subRoutes.length - 1;
  }

  /**
   * Get total flight time
   */
  static getTotalFlightTime(flight: FlightOption): string {
    const outboundSegment = flight.segments[0];
    if (!outboundSegment || !outboundSegment.routes[0]) return '0h 0m';
    
    return this.formatFlightDuration(outboundSegment.routes[0].flightTime);
  }

  /**
   * Sort flights by price (ascending)
   */
  static sortFlightsByPrice(flights: FlightOption[]): FlightOption[] {
    return [...flights].sort((a, b) => a.price.total - b.price.total);
  }

  /**
   * Sort flights by duration (ascending)
   */
  static sortFlightsByDuration(flights: FlightOption[]): FlightOption[] {
    return [...flights].sort((a, b) => {
      const durationA = parseInt(a.segments[0]?.routes[0]?.flightTime || '0');
      const durationB = parseInt(b.segments[0]?.routes[0]?.flightTime || '0');
      return durationA - durationB;
    });
  }

  /**
   * Filter flights by max price
   */
  static filterFlightsByMaxPrice(flights: FlightOption[], maxPrice: number): FlightOption[] {
    return flights.filter(flight => flight.price.total <= maxPrice);
  }

  /**
   * Filter flights by max stops
   */
  static filterFlightsByMaxStops(flights: FlightOption[], maxStops: number): FlightOption[] {
    return flights.filter(flight => this.getFlightStops(flight) <= maxStops);
  }
}

export default FlightService;
