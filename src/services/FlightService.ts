import { Flight, FlightSearchCriteria, FlightModel } from '../models/Flight';
import { PassengerInfo, PassengerSearchCriteria, FlightCategory } from '../models/Passenger';

export class FlightService {
  constructor() {
    this.initializeSampleData();
  }

  /*
    Obtener todos los vuelos
    GET /flights
  */
  async getAllFlights(): Promise<Flight[]> {
    return await FlightModel.find();
  }

  /*
    Obtener vuelo por código
    GET /flights/:flightCode
  */
  async getFlightByCode(flightCode: string): Promise<Flight> {
    const flight = await FlightModel.findOne({ flightCode });
    
    if (!flight) {
      throw new Error(`Vuelo con código ${flightCode} no encontrado`);
    }

    return flight;
  }

  /*
    Crear nuevo vuelo
    POST /flights
  */
  async createFlight(flightData: { flightCode: string; passengers: PassengerInfo[] }): Promise<Flight> {
    // Verificar que no exista un vuelo con el mismo código
    const existingFlight = await FlightModel.findOne({ flightCode: flightData.flightCode });
    
    if (existingFlight) {
      throw new Error(`Ya existe un vuelo con código ${flightData.flightCode}`);
    }

    const flight = new FlightModel(flightData);
    return await flight.save();
  }

  /*
    Actualizar vuelo existente
    PUT /flights/:flightCode
  */
  async updateFlight(flightCode: string, flightData: Partial<Flight>): Promise<Flight> {
    const flight = await FlightModel.findOne({ flightCode });
    
    if (!flight) {
      throw new Error(`Vuelo con código ${flightCode} no encontrado`);
    }

    if (flightData.flightCode && flightData.flightCode !== flightCode) {
      const existingFlight = await FlightModel.findOne({ flightCode: flightData.flightCode });
      if (existingFlight) {
        throw new Error(`Ya existe un vuelo con código ${flightData.flightCode}`);
      }
    }

    Object.assign(flight, flightData);
    return await flight.save();
  }

  /*
    Eliminar vuelo
    DELETE /flights/:flightCode
  */
  async deleteFlight(flightCode: string): Promise<void> {
    const result = await FlightModel.deleteOne({ flightCode });
    
    if (result.deletedCount === 0) {
      throw new Error(`Vuelo con código ${flightCode} no encontrado`);
    }
  }

  /*
    Buscar vuelos con criterios
    GET /flights
  */
  async searchFlights(criteria: FlightSearchCriteria): Promise<Flight[]> {
    const query: any = {};
    
    if (criteria.flightCode) {
      query.flightCode = criteria.flightCode;
    }
    
    if (criteria.reservationId) {
      query['passengers.reservationId'] = criteria.reservationId;
    }
    
    if (criteria.flightCategory) {
      query['passengers.flightCategory'] = criteria.flightCategory;
    }
    
    if (criteria.hasConnections !== undefined) {
      query['passengers.hasConnections'] = criteria.hasConnections;
    }
    
    if (criteria.hasCheckedBaggage !== undefined) {
      query['passengers.hasCheckedBaggage'] = criteria.hasCheckedBaggage;
    }

    return await FlightModel.find(query);
  }

  /*
    Obtener pasajeros de un vuelo
    GET /flights/:flightCode/passengers
  */
  async getPassengersByFlight(flightCode: string): Promise<PassengerInfo[]> {
    const flight = await this.getFlightByCode(flightCode);
    return flight.passengers;
  }

  /*
    Agregar pasajero a un vuelo
    POST /flights/:flightCode/passengers
  */
  async addPassengerToFlight(flightCode: string, passenger: PassengerInfo): Promise<Flight> {
    const flight = await this.getFlightByCode(flightCode);
    
    // Verificar que no exista un pasajero con el mismo ID
    const existingPassenger = flight.passengers.find(p => p.id === passenger.id);
    if (existingPassenger) {
      throw new Error(`Ya existe un pasajero con ID ${passenger.id} en el vuelo ${flightCode}`);
    }

    flight.passengers.push(passenger);
    return await flight.save();
  }

  /*
    Actualizar pasajero en un vuelo
    PUT /flights/:flightCode/passengers/:passengerId
  */
  async updatePassengerInFlight(flightCode: string, passengerId: number, passengerData: Partial<PassengerInfo>): Promise<Flight> {
    const flight = await this.getFlightByCode(flightCode);
    
    const passengerIndex = flight.passengers.findIndex(p => p.id === passengerId);
    if (passengerIndex === -1) {
      throw new Error(`Pasajero con ID ${passengerId} no encontrado en el vuelo ${flightCode}`);
    }

    const updatedPassenger = { ...flight.passengers[passengerIndex], ...passengerData } as PassengerInfo;
    flight.passengers[passengerIndex] = updatedPassenger;
    return await flight.save();
  }

  /*
    Eliminar pasajero de un vuelo
    DELETE /flights/:flightCode/passengers/:passengerId
  */
  async removePassengerFromFlight(flightCode: string, passengerId: number): Promise<Flight> {
    const flight = await this.getFlightByCode(flightCode);
    
    const passengerIndex = flight.passengers.findIndex(p => p.id === passengerId);
    if (passengerIndex === -1) {
      throw new Error(`Pasajero con ID ${passengerId} no encontrado en el vuelo ${flightCode}`);
    }

    flight.passengers.splice(passengerIndex, 1);
    return await flight.save();
  }

  /*
    Buscar pasajeros en todos los vuelos
    GET /passengers
  */
  async searchPassengers(criteria: PassengerSearchCriteria): Promise<PassengerInfo[]> {
    const flights = await FlightModel.find();
    const allPassengers: PassengerInfo[] = [];
    
    flights.forEach(flight => {
      allPassengers.push(...flight.passengers);
    });

    return allPassengers.filter(passenger => {
      if (criteria.id && passenger.id !== criteria.id) {
        return false;
      }
      if (criteria.name && !passenger.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      if (criteria.reservationId && passenger.reservationId !== criteria.reservationId) {
        return false;
      }
      if (criteria.flightCategory && passenger.flightCategory !== criteria.flightCategory) {
        return false;
      }
      if (criteria.hasConnections !== undefined && passenger.hasConnections !== criteria.hasConnections) {
        return false;
      }
      if (criteria.hasCheckedBaggage !== undefined && passenger.hasCheckedBaggage !== criteria.hasCheckedBaggage) {
        return false;
      }
      if (criteria.minAge && passenger.age < criteria.minAge) {
        return false;
      }
      if (criteria.maxAge && passenger.age > criteria.maxAge) {
        return false;
      }
      return true;
    });
  }

  /*
    Inicializar datos de ejemplo
  */
  private async initializeSampleData(): Promise<void> {
    try {
      // Verificar si ya hay datos
      const existingFlights = await FlightModel.countDocuments();
      if (existingFlights > 0) {
        return;
      }

      const sampleFlights = [
        {
          flightCode: "LAN123",
          passengers: [
            {
              id: 139577,
              name: "Martín Alvarez",
              hasConnections: false,
              age: 2,
              flightCategory: FlightCategory.GOLD,
              reservationId: "8ZC5KYVK",
              hasCheckedBaggage: false
            },
            {
              id: 530874,
              name: "Jorge Hernández",
              hasConnections: false,
              age: 16,
              flightCategory: FlightCategory.BLACK,
              reservationId: "O2DQ3SZS",
              hasCheckedBaggage: false
            }
          ]
        },
        {
          flightCode: "SKY123",
          passengers: [
            {
              id: 426098,
              name: "Pedro Ruiz",
              hasConnections: false,
              age: 33,
              flightCategory: FlightCategory.BLACK,
              reservationId: "KSXXOALO",
              hasCheckedBaggage: true
            }
          ]
        }
      ];

      await FlightModel.insertMany(sampleFlights);
    } catch (error) {
      throw new Error('Error insertando datos de ejemplo');
    }
  }
} 