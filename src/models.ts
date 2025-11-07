// Knowledge Base
export interface Base {
    baseId: string;
    baseName: string;
    vectorStoreId: string;
    createdAt: number;
    storageType: string ;
    storagePath: string
  }
  
  export interface Document {
    baseId: string;
    documentId: string;
    documentValue: string;
    documentType: string;
    createdAt: number;
    status: string;
    chunks: number; // Number of chunks created from the document
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
    name: string;
    createdAt: number;
    provider: string;
    model: string;
    temperature: number;
    instructions: string;
    firstPrompt: string;
    phone: string;
    maxTokens: number;
    voice: string;
    apiKey: string;
    recordingEnabled: boolean;
    baseId: string;
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

  export interface User {
    clientId: string;
    role: string;
    email: string;
    name: string;
    phone: string;
  }

  export interface embedding {
    embeddingId: string;
    embeddingVendor: string;
    embeddingModel: string;
    embeddingDimensions: number;
    apiKey: string;
  }

  export interface VectorStore {
    vectorStoreId: string;
    vectorStoreName: string;
    embeddingId: string;
    vectorStoreVendor: string;
    vectorStoreConfig: any;
  }

  export interface Pipeline {
    pipelineId: string;
    pipelineName: string;
    pipelineData: any;
  }