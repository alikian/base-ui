export interface Base {
    id: string;
    ownerId: string;
    name: string;
    model: string;
    dimensions: number;
    createdAt: Date;
    // Add other properties as needed
  }
  
  export interface Document {
    id: string;
    title: string;
    type: string;
    size: number;
    // Add other properties as needed
  }