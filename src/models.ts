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
    id: string;
    title: string;
    type: string;
    size: number;
    // Add other properties as needed
  }