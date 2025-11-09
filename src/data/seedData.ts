import { Request, Resource } from '@/types/request';

export const seedRequests: Request[] = [
  {
    id: '1',
    category: 'Food',
    description: 'Need dinner near Mission',
    tone: 'Calm',
    status: 'open',
    location: {
      lat: 37.7599,
      lng: -122.4148,
      address: 'Mission District, SF'
    },
    name: 'Maria',
    phone: '+14155551234',
    conversation: [
      'Hi, I\'m looking for a hot meal tonight.',
      'I can help you find nearby food banks. There\'s one on 16th Street open until 7pm.'
    ],
    memory: [
      'Vegetarian preference',
      'Available after 6pm',
      'Lives in Mission area'
    ],
    timestamp: new Date(Date.now() - 30 * 60000)
  },
  {
    id: '2',
    category: 'Shelter',
    description: 'Looking for bed tonight in SoMa',
    tone: 'Anxious',
    status: 'open',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'SoMa, SF'
    },
    name: 'Anonymous',
    conversation: [
      'I need a place to sleep tonight, it\'s getting cold.',
      'I understand. Let me check shelter availability in SoMa for you.'
    ],
    memory: [
      'Prefers quiet spaces',
      'Has backpack with belongings'
    ],
    timestamp: new Date(Date.now() - 15 * 60000)
  },
  {
    id: '3',
    category: 'Legal',
    description: 'Need help with housing documentation',
    tone: 'Calm',
    status: 'assigned',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: 'Tenderloin, SF'
    },
    name: 'James',
    phone: '+14155552468',
    conversation: [
      'I need assistance filling out housing assistance forms.',
      'I can connect you with legal aid services. They have walk-in hours tomorrow.'
    ],
    memory: [
      'Limited English proficiency',
      'Needs Spanish interpreter',
      'Has partial documentation'
    ],
    timestamp: new Date(Date.now() - 60 * 60000)
  },
  {
    id: '4',
    category: 'Other',
    description: 'Medical supplies needed',
    tone: 'Distressed',
    status: 'open',
    location: {
      lat: 37.7694,
      lng: -122.4862,
      address: 'Richmond District, SF'
    },
    name: 'Anonymous',
    conversation: [
      'I ran out of my medication and can\'t afford refills.',
      'This is urgent. Let me connect you with a health clinic that offers assistance programs.'
    ],
    memory: [
      'Has chronic condition',
      'No health insurance',
      'Needs prescription refill urgently'
    ],
    timestamp: new Date(Date.now() - 5 * 60000)
  }
];

export const seedResources: Resource[] = [
  {
    id: 'r1',
    type: 'food',
    name: 'Mission Food Bank',
    location: {
      lat: 37.7599,
      lng: -122.4148,
      address: '16th Street, Mission'
    }
  },
  {
    id: 'r2',
    type: 'food',
    name: 'Community Kitchen',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: 'Tenderloin Community Center'
    }
  },
  {
    id: 'r3',
    type: 'shelter',
    name: 'SoMa Shelter',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '5th Street, SoMa'
    }
  },
  {
    id: 'r4',
    type: 'shelter',
    name: 'Bay Area Shelter',
    location: {
      lat: 37.7694,
      lng: -122.4862,
      address: 'Geary Boulevard, Richmond'
    }
  }
];
