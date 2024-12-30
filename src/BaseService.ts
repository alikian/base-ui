import axios, { AxiosResponse } from 'axios';
import { Base, Document } from './models';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = 'https://api.vectorsystem.net'; // Replace with your API Gateway URL

async function getJwtToken() {
  try {
    const session = await fetchAuthSession();
    console.log(session);
    const jwtToken = session.tokens?.idToken?.toString();
    return jwtToken;
  } catch (error) {
    console.error('Error retrieving JWT token:', error);
  }
}

const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Failed to retrieve JWT token');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};




class BaseService {
  async getBase(baseId: string): Promise<Base> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Base> = await axios.get(`${API_BASE_URL}/bases/${baseId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching base:', error);
      throw error;
    }
  }
  async createBase(baseData: Base): Promise<Base> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Base> = await axios.post(`${API_BASE_URL}/bases`, baseData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating base:', error);
      throw error;
    }
  }

  async listBases(): Promise<Base[]> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Base[]> = await axios.get(`${API_BASE_URL}/bases`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error listing bases:', error);
      throw error;
    }
  }

  async listDocuments(baseId: string): Promise<Document[]> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Document[]> = await axios.get(`${API_BASE_URL}/bases/${baseId}/documents`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  async createDocument(baseId: string, documentData: Document): Promise<Document> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Document> = await axios.post(`${API_BASE_URL}/bases/${baseId}/documents`, documentData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocument(baseId: string, documentId: string): Promise<Document> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Document> = await axios.get(`${API_BASE_URL}/bases/${baseId}/documents/${documentId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }
}
export default BaseService;