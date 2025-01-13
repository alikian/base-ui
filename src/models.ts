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
    documentName: string;
    documentType: string;
    size: number;
    createdAt: number;
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