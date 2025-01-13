import axios from 'axios';
import AuthService from './AuthService';
import { Message, MessageResponse } from '../models';

export class ChatbotRunService {
    private baseUrl : string;
    private endpoint: string;
    authService = new AuthService();

    constructor(chatbotId: string) {
        this.baseUrl = 'https://api.vectorsystem.net';
        this.endpoint = `${this.baseUrl}/chatbots/${chatbotId}/run`;
      }

      async postMessage(item: Message): Promise<MessageResponse> {
        try {
          const headers = await this.authService.getAuthHeaders();
          const response = await axios.post(this.endpoint, item, {
            headers: headers,
          });
          return response.data;
        } catch (error) {
          console.error('Error creating item:', error);
          throw error;
        }
      }
}

export default ChatbotRunService; 