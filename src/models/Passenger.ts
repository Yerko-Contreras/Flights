export interface PassengerInfo {
  id: number;
  name: string;
  hasConnections: boolean;
  age: number;
  flightCategory: FlightCategory;
  reservationId: string;
  hasCheckedBaggage: boolean;
}

export interface PassengerSearchCriteria {
  id?: number;
  name?: string;
  reservationId?: string;
  flightCategory?: FlightCategory;
  hasConnections?: boolean;
  hasCheckedBaggage?: boolean;
  minAge?: number;
  maxAge?: number;
} 

export enum FlightCategory {
  BLACK = 'Black',
  PLATINUM = 'Platinum',
  GOLD = 'Gold',
  NORMAL = 'Normal'
}