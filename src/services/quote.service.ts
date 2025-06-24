import apiClient from '@/lib/api-client';
import {
  NewQuoteRequest,
  NewQuoteResponse,
  Quote,
  Customer,
  Client,
  FlightOption,
  AddProductRequest,
  RouteInfo,
  ProductType,
  FareData,
  PassengerData,
  ApiResponse
} from '@/types/api';

export class QuoteService {
  /**
   * Create a new quote
   */
  static async createNewQuote(quoteData: NewQuoteRequest, numberQuote?: string): Promise<Quote> {
    try {
      const url = numberQuote 
        ? `/quote/newQuote?numberQuote=${numberQuote}` 
        : '/quote/newQuote';

      const response = await apiClient.post<NewQuoteResponse>(url, quoteData);
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to create quote');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to create quote:', error);
      throw new Error('Failed to create new quote');
    }
  }

  /**
   * Add flight product to quote
   */
  static async addFlightProductToQuote(
    quoteNumber: string, 
    productData: AddProductRequest
  ): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/quote/addProductSelectedAir/${quoteNumber}`,
        productData
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to add product to quote');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to add product to quote:', error);
      throw new Error('Failed to add flight to quote');
    }
  }

  /**
   * Accept products in quote
   */
  static async acceptProducts(quoteNumber: string): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/quote/addProductList/${quoteNumber}`
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to accept products');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to accept products:', error);
      throw new Error('Failed to accept quote products');
    }
  }

  /**
   * Change quote step
   */
  static async changeQuoteStep(quoteNumber: string, step: number): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/quote/${quoteNumber}/changeStep?step=${step}`
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to change quote step');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to change quote step:', error);
      throw new Error('Failed to update quote step');
    }
  }

  /**
   * Get quote by number
   */
  static async getQuoteByNumber(quoteNumber: string): Promise<Quote> {
    try {
      const response = await apiClient.post<ApiResponse<Quote>>(
        `/quote/findByNumber/${quoteNumber}`
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Quote not found');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw new Error('Failed to retrieve quote');
    }
  }

  /**
   * Create basic quote request from customer and client data
   */
  static createQuoteRequest(
    client: Client,
    customer: Customer,
    postalCode: string = "86179"
  ): NewQuoteRequest {
    return {
      client,
      customer,
      quoteCampaign: null,
      postalCode,
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
  }

  /**
   * Create add product request from flight selection
   */
  static createAddProductRequest(
    selectedFlight: FlightOption,
    searchOptions: {
      flightType: string;
      route: RouteInfo;
    }
  ): AddProductRequest {
    const product: AddProductRequest = {
      tipoVueloEnum: searchOptions.flightType === "OPENJAW" ? "OPEN_JAW" : searchOptions.flightType,
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
        currency: { type: selectedFlight.currency }
      },
      productType: {
        typeProduct: "Air",
        description: "Aéreo"
      },
      route: searchOptions.route,
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

    // Create passenger data list
    selectedFlight.price.passengerPrices.forEach(passengerPrice => {
      const passengerData: PassengerData = {
        age: 0,
        birthday: null,
        fareData: {
          aditionalFee: 0,
          baseFare: passengerPrice.baseFare,
          commission: 0,
          commissionPercentage: 0,
          currency: { type: selectedFlight.currency },
          equivFare: 0,
          price: 0,
          providerPrice: 0,
          revenue: passengerPrice.revenue,
          serviceCharge: passengerPrice.serviceCharge,
          tax: passengerPrice.tax,
          total: passengerPrice.total
        },
        gender: "",
        id: "",
        lastName: "",
        mail: "",
        mothersName: "",
        name: "",
        passengerCode: {
          accountCode: passengerPrice.accountCode,
          promo: selectedFlight.promo,
          realType: passengerPrice.passengerType,
          type: passengerPrice.passengerType
        },
        phone: ""
      };

      product.passengerDataList.push(passengerData);
    });

    return product;
  }

  /**
   * Complete quote creation workflow
   */
  static async createCompleteQuote(
    client: Client,
    customer: Customer,
    selectedFlight: FlightOption,
    searchOptions: {
      flightType: string;
      route: RouteInfo;
    },
    postalCode?: string
  ): Promise<Quote> {
    try {
      // Step 1: Create new quote
      const quoteRequest = this.createQuoteRequest(client, customer, postalCode);
      const quote = await this.createNewQuote(quoteRequest);

      // Step 2: Add flight product to quote
      const productRequest = this.createAddProductRequest(selectedFlight, searchOptions);
      await this.addFlightProductToQuote(quote.number, productRequest);

      // Step 3: Accept products
      await this.acceptProducts(quote.number);

      // Step 4: Change quote step to 4
      await this.changeQuoteStep(quote.number, 4);

      // Step 5: Return updated quote
      return await this.getQuoteByNumber(quote.number);
    } catch (error) {
      console.error('Failed to create complete quote:', error);
      throw error;
    }
  }

  /**
   * Format quote display name
   */
  static formatQuoteName(quote: Quote): string {
    return quote.name || `Quote ${quote.number}`;
  }

  /**
   * Get quote status based on step (if available)
   */
  static getQuoteStatus(quote: any): string {
    // This would depend on the actual quote structure returned by the API
    if (quote.step) {
      switch (quote.step) {
        case 1: return 'Created';
        case 2: return 'Products Added';
        case 3: return 'Products Accepted';
        case 4: return 'Completed';
        default: return 'Unknown';
      }
    }
    return 'Active';
  }
}

export default QuoteService;
