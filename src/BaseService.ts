import axios, { AxiosResponse } from 'axios';
import { Base, Chunck, Document } from './models';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

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

const getAuthHeaders = async (): Promise<{ Authorization: string; 'Content-Type': string }> => {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Failed to retrieve JWT token');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json', // Added Content-Type header
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

  async deleteBase(baseId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/bases/${baseId}`, {
        headers,
      });
    } catch (error) {
      console.error('Error deleting base:', error);
      throw error;
    }
  }

  async updateBase(baseId: string, updatedBase: Partial<Base>): Promise<Base> {

    // implementation
    console.log('Updating base with ID:', baseId);

    return updatedBase as Base; // replace with actual implementation

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

  async searchChunk(baseId: string, query: string): Promise<Chunck[]> {
    try {
      const headers = await getAuthHeaders();
      const response: AxiosResponse<Chunck[]> = await axios.get(`${API_BASE_URL}/bases/${baseId}/chunks?`, {
        headers,
        params: {
          query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching chunks:', error);
      throw error;
    }
  }
  
  async deleteDocument(baseId: string, documentId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/bases/${baseId}/documents/${documentId}`, {
        headers,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async generatePresign(baseId:string, fileData:{ fileName: string; fileType: string }[]){
    const headers = await getAuthHeaders();
    console.log('Generating presign for base with ID:', baseId);
    console.log('File data:', JSON.stringify(fileData));
    const response = await fetch(`${API_BASE_URL}/bases/${baseId}/presigneds`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(fileData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // Define `data` here with the JSON response
    return data;
  }
}

export default BaseService;