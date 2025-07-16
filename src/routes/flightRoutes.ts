import { Router } from 'express';
import { FlightController } from '../controllers/FlightController';

export function createFlightRoutes(flightController: FlightController): Router {
  const router = Router();

  // Obtener todos los vuelos (con filtros opcionales)
  router.get('/', flightController.getAllFlights.bind(flightController));

  // Obtener vuelo por código
  router.get('/:flightCode', flightController.getFlightByCode.bind(flightController));

  // Crear nuevo vuelo
  router.post('/', flightController.createFlight.bind(flightController));

  // Actualizar vuelo
  router.put('/:flightCode', flightController.updateFlight.bind(flightController));

  // Eliminar vuelo
  router.delete('/:flightCode', flightController.deleteFlight.bind(flightController));

  // Agregar pasajero a vuelo
  router.post('/:flightCode/passengers', flightController.addPassengerToFlight.bind(flightController));

  // Actualizar pasajero en vuelo
  router.put('/:flightCode/passengers/:passengerId', flightController.updatePassengerInFlight.bind(flightController));

  // Eliminar pasajero de vuelo
  router.delete('/:flightCode/passengers/:passengerId', flightController.removePassengerFromFlight.bind(flightController));

  return router;
} 