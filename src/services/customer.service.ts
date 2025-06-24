import apiClient from '@/lib/api-client';
import { CustomerSearchResponse, Customer } from '@/types/api';

export class CustomerService {
  /**
   * Search for customers by email
   */
  static async findCustomerByEmail(email: string): Promise<Customer[]> {
    try {
      const response = await apiClient.get<CustomerSearchResponse>(
        `/customercrm/findCustomer/${encodeURIComponent(email)}`
      );
      
      if (!response.status) {
        throw new Error(response.message || 'Customer search failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Customer search failed:', error);
      throw new Error('Failed to search for customer');
    }
  }

  /**
   * Get customer by ID (if such endpoint exists)
   */
  static async getCustomerById(customerId: string): Promise<Customer> {
    try {
      // This would need to be implemented if the API supports it
      const response = await apiClient.get<{ data: Customer }>(
        `/customercrm/customer/${customerId}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to get customer by ID:', error);
      throw new Error('Failed to retrieve customer details');
    }
  }

  /**
   * Validate customer email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format customer display name
   */
  static formatCustomerName(customer: Customer): string {
    const parts = [
      customer.firstName,
      customer.lastName,
      customer.mothersName
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(' ');
  }

  /**
   * Get customer primary email
   */
  static getPrimaryEmail(customer: Customer): string | null {
    const activeEmail = customer.emails.find(email => email.active);
    return activeEmail?.emailAddress || customer.emails[0]?.emailAddress || null;
  }

  /**
   * Get customer primary phone
   */
  static getPrimaryPhone(customer: Customer): string | null {
    const activePhone = customer.phones.find(phone => phone.active);
    return activePhone?.number || customer.phones[0]?.number || null;
  }
}

export default CustomerService;
