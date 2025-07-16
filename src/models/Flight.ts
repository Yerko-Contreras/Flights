import mongoose, { Document, Schema } from 'mongoose';
import { PassengerInfo } from './Passenger';

export interface Flight extends Document {
  flightCode: string;
  passengers: PassengerInfo[];
}

export interface FlightSearchCriteria {
  flightCode?: string;
  reservationId?: string;
  flightCategory?: string;
  hasConnections?: boolean;
  hasCheckedBaggage?: boolean;
}

const FlightSchema: Schema = new Schema({
  flightCode: {
    type: String,
    required: true,
    unique: true
  },
  passengers: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    hasConnections: { type: Boolean, required: true },
    age: { type: Number, required: true },
    flightCategory: { type: String, required: true },
    reservationId: { type: String, required: true },
    hasCheckedBaggage: { type: Boolean, required: true }
  }]
}, { timestamps: true });

export const FlightModel = mongoose.model<Flight>('Flight', FlightSchema);