import { Response } from 'express';

export class ResponseHelper {
  /*
    Enviar respuesta exitosa
  */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date()
    });
  }

  /*
    Enviar respuesta de error
  */
  static error(
    res: Response,
    error: unknown,
    statusCode: number = 500
  ): void {
    let message = 'Error interno del servidor';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message
      },
      timestamp: new Date()
    });
  }

  /*
    Enviar respuesta vacía (para operaciones DELETE)
  */
  static noContent(res: Response): void {
    res.status(204).send();
  }
} 