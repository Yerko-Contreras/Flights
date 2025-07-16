import express from 'express';
import cors from 'cors';
import { FlightService } from './services/FlightService';
import { FlightController } from './controllers/FlightController';
import { createFlightRoutes } from './routes/flightRoutes';
import { Database } from './config/database';

export class App {
  private app: express.Application;
  private flightService: FlightService;
  private flightController: FlightController;

  constructor() {
    this.app = express();
    this.flightService = new FlightService();
    this.flightController = new FlightController(this.flightService);
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Rutas de vuelos
    this.app.use('/api/flights', createFlightRoutes(this.flightController));

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date()
      });
    });
  }

  public async start(port: number): Promise<void> {
    try {
      // Conectar a MongoDB
      await Database.getInstance().connect();
      
      // Iniciar el servidor
      this.app.listen(port, () => {
        console.log(`Servidor iniciado en puerto ${port}`);
        console.log(`Health check disponible en http://localhost:${port}/health`);
      });
    } catch (error) {
      console.error('Error iniciando la aplicación:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
} 