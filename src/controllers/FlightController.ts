import { Request, Response } from 'express';
import { FlightService } from '../services/FlightService';
import { FlightSearchCriteria } from '../models/Flight';
import { PassengerInfo, FlightCategory } from '../models/Passenger';
import { ResponseHelper } from '../utils/ResponseHelper';

export class FlightController {
  private flightService: FlightService;

  constructor(flightService: FlightService) {
    this.flightService = flightService;
  }

  /*
    Obtener todos los vuelos (con filtros opcionales)
    GET /flights
  */
  async getAllFlights(req: Request, res: Response): Promise<void> {
    try {
      const hasFilters = Object.keys(req.query).length > 0;
      
      if (hasFilters) {
        const criteria: FlightSearchCriteria = {
          flightCode: req.query.flightCode as string,
          reservationId: req.query.reservationId as string,
          flightCategory: req.query.flightCategory as string,
          hasConnections: req.query.hasConnections === 'true' ? true : req.query.hasConnections === 'false' ? false : undefined,
          hasCheckedBaggage: req.query.hasCheckedBaggage === 'true' ? true : req.query.hasCheckedBaggage === 'false' ? false : undefined
        };

        const flights = await this.flightService.searchFlights(criteria);
        ResponseHelper.success(res, flights, 'Vuelos filtrados obtenidos exitosamente');
      } else {
        const flights = await this.flightService.getAllFlights();
        ResponseHelper.success(res, flights, 'Vuelos obtenidos exitosamente');
      }
    } catch (error) {
      ResponseHelper.error(res, error);
    }
  }

  /*
    Obtener vuelo por código
    GET /flights/:flightCode
  */
  async getFlightByCode(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode } = req.params;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }

      const flight = await this.flightService.getFlightByCode(flightCode);
      ResponseHelper.success(res, flight, 'Vuelo obtenido exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 404);
    }
  }

  /*
    Crear nuevo vuelo
    POST /flights
  */
  async createFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode, passengers } = req.body;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }
      
      if (!passengers || !Array.isArray(passengers)) {
        return ResponseHelper.error(res, 'Los pasajeros son requeridos y deben ser un array', 400);
      }

      for (const passenger of passengers) {
        if (!passenger.id || !passenger.name || !passenger.reservationId) {
          return ResponseHelper.error(res, 'Cada pasajero debe tener id, name y reservationId', 400);
        }
        
        if (!Object.values(FlightCategory).includes(passenger.flightCategory)) {
          return ResponseHelper.error(res, 'flightCategory debe ser: Black, Platinum, Gold o Normal', 400);
        }
      }

      const newFlight = await this.flightService.createFlight({ flightCode, passengers });
      ResponseHelper.success(res, newFlight, 'Vuelo creado exitosamente', 201);
    } catch (error) {
      ResponseHelper.error(res, error, 400);
    }
  }

  /*
    Actualizar vuelo
    PUT /flights/:flightCode
  */
  async updateFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode } = req.params;
      const updateData = req.body;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }

      if (updateData.passengers && Array.isArray(updateData.passengers)) {
        for (const passenger of updateData.passengers) {
          if (passenger.flightCategory && !Object.values(FlightCategory).includes(passenger.flightCategory)) {
            return ResponseHelper.error(res, 'flightCategory debe ser: Black, Platinum, Gold o Normal', 400);
          }
        }
      }

      const updatedFlight = await this.flightService.updateFlight(flightCode, updateData);
      ResponseHelper.success(res, updatedFlight, 'Vuelo actualizado exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 400);
    }
  }

  /*
    Eliminar vuelo
    DELETE /flights/:flightCode
  */
  async deleteFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode } = req.params;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }

      await this.flightService.deleteFlight(flightCode);
      ResponseHelper.success(res, null, 'Vuelo eliminado exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 404);
    }
  }

  /*
    Agregar pasajero a vuelo
    POST /flights/:flightCode/passengers
  */
  async addPassengerToFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode } = req.params;
      const passenger = req.body;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }

      if (!passenger.id || !passenger.name || !passenger.reservationId) {
        return ResponseHelper.error(res, 'id, name y reservationId son requeridos', 400);
      }
      
      if (!Object.values(FlightCategory).includes(passenger.flightCategory)) {
        return ResponseHelper.error(res, 'flightCategory debe ser: Black, Platinum, Gold o Normal', 400);
      }

      const updatedFlight = await this.flightService.addPassengerToFlight(flightCode, passenger);
      ResponseHelper.success(res, updatedFlight, 'Pasajero agregado exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 400);
    }
  }

  /*
    Actualizar pasajero en vuelo
    PUT /flights/:flightCode/passengers/:passengerId
  */
  async updatePassengerInFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode, passengerId } = req.params;
      const updateData = req.body;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }
      
      if (!passengerId || isNaN(parseInt(passengerId))) {
        return ResponseHelper.error(res, 'ID de pasajero válido es requerido', 400);
      }

      if (updateData.flightCategory && !Object.values(FlightCategory).includes(updateData.flightCategory)) {
        return ResponseHelper.error(res, 'flightCategory debe ser: Black, Platinum, Gold o Normal', 400);
      }

      const updatedFlight = await this.flightService.updatePassengerInFlight(flightCode, parseInt(passengerId), updateData);
      ResponseHelper.success(res, updatedFlight, 'Pasajero actualizado exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 400);
    }
  }

  /*
    Eliminar pasajero de vuelo
    DELETE /flights/:flightCode/passengers/:passengerId
  */
  async removePassengerFromFlight(req: Request, res: Response): Promise<void> {
    try {
      const { flightCode, passengerId } = req.params;
      
      if (!flightCode) {
        return ResponseHelper.error(res, 'El código de vuelo es requerido', 400);
      }
      
      if (!passengerId || isNaN(parseInt(passengerId))) {
        return ResponseHelper.error(res, 'ID de pasajero válido es requerido', 400);
      }

      const updatedFlight = await this.flightService.removePassengerFromFlight(flightCode, parseInt(passengerId));
      ResponseHelper.success(res, updatedFlight, 'Pasajero eliminado exitosamente');
    } catch (error) {
      ResponseHelper.error(res, error, 404);
    }
  }
} 