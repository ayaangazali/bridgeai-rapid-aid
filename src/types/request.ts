export type Category = 'Food' | 'Shelter' | 'Legal' | 'Other';
export type Tone = 'Calm' | 'Anxious' | 'Distressed';
export type Status = 'open' | 'assigned' | 'resolved';

export interface Request {
  id: string;
  category: Category;
  description: string;
  tone: Tone;
  status: Status;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  name?: string;
  conversation: string[];
  memory: string[];
  timestamp: Date;
}

export interface Resource {
  id: string;
  type: 'food' | 'shelter';
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}
