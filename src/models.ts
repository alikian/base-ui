export interface Base {
    baseId: string;
    ownerId: string;
    baseName: string;
    modelName: string;
    dimensions: number;
    createdAt: number;
    // Add other properties as needed
  }
  
  export interface Document {
    baseId: string;
    documentId: string;
    documentValue: string;
    documentType: string;
    createdAt: number;
    status: string;
    // Add other properties as needed
  }

  export interface Chunck {
    id: string;
    text: string;
  }

  export interface Chatbot {
    chatbotId: string;
    baseId: string;
    chatbotName: string;
    chatbotDescription: string;
    createdAt: number;
    llm: string;
    llmModel: string;
    llmTemperature: number;
    aqPrompt: string;
    cqPrompt: string;
  }

  export interface Voicebot {
    voicebotId: string;
    voicebotName: string;
    createdAt: number;
    llm: string;
    llmModel: string;
    llmTemperature: number;
    instructions: string;
    maxTokens: number;
    voice: string;
  }

  export interface Conversation {
    conversationId: string;
    chatbotId: string;
    createdAt: number;
    // Add other properties as needed
  }

  export interface Message {
    conversationId: string;
    text: string;
    sender: 'user' | 'chatbot';
    timestamp: number;
  }

  export interface MessageResponse {
    text: string;
  }