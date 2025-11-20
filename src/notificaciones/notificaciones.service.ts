import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notificaciones.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  /**
   * Envía un mensaje a todos los clientes conectados.
   * @param event El nombre del evento que el cliente debe escuchar (ej: 'citaCancelada').
   * @param data El payload del mensaje.
   */
  notifyAll(event: string, data: any): void {
    const server = this.notificationGateway.getServer();
    if (server) {
      server.emit(event, data);
      console.log(data);
      console.log(`[NotifService] Emitido a todos: ${event} ${JSON.stringify(data)}`);
    }
  }

  /**
   * Envía un mensaje específico a un doctor/usuario usando su Room/Sala.
   * Esto requiere que el cliente haya sido unido a una sala en handleConnection.
   * @param userId El ID del doctor al que se le envía la notificación.
   * @param event El nombre del evento.
   * @param data El payload del mensaje.
   */
  notifyDoctor(userId: number, event: string, data: any): void {
    const server = this.notificationGateway.getServer();
    const roomName = `user-${userId}`; // Asegúrate de que este nombre coincida con tu lógica en el Gateway
    
    if (server) {
        // Usa .to() para enviar a una sala específica
        server.to(roomName).emit(event, data);
        console.log(`[NotifService] Emitido a Sala ${roomName}: ${event}`);

        // Opcional: Si no usas Rooms, puedes usar notifyAll y dejar que el cliente filtre
        // this.notifyAll(event, data); 
    }
  }
}