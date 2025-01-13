import AuthService from './AuthService';
import axios from 'axios';


export class DataService<T> {
  private baseUrl : string;
  private endpoint: string;
  authService = new AuthService();

  constructor(endpoint: string) {
    this.baseUrl = 'https://api.vectorsystem.net';
    this.endpoint = endpoint;
  }

  private getFullUrl(id?: string): string {
    return id ? `${this.baseUrl}/${this.endpoint}/${id}` : `${this.baseUrl}/${this.endpoint}`;
  }

  async create(item: T): Promise<T> {
    try {
      const headers = await this.authService.getAuthHeaders();
      const response = await axios.post(this.getFullUrl(), item, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async get(id: string): Promise<T> {
    try {
      const headers = await this.authService.getAuthHeaders();
      const response = await axios.get(this.getFullUrl(id), {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const headers = await this.authService.getAuthHeaders();
      const response = await axios.get(this.getFullUrl(), {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  async update(id: string, item: T): Promise<T> {
    try {
      const headers = await this.authService.getAuthHeaders();
      const response = await axios.put(this.getFullUrl(id), item, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const headers = await this.authService.getAuthHeaders();
      await axios.delete(this.getFullUrl(id),{
        headers: headers,
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

}