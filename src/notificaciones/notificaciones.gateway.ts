import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  // Asegúrate de que el puerto y las opciones sean correctas
  // Puerto de la aplicación principal de NestJS.
  cors: {
    // Es crucial especificar el origen de tu frontend para evitar el error CORS.
    origin: 'http://localhost:5173', // O el dominio de tu frontend en producción
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server; // La instancia del servidor Socket.IO

  // Método que será llamado por el NotificationService
  getServer(): Server {
    return this.server;
  }

  // Métodos de ciclo de vida
  afterInit(server: Server) {
    console.log('✅ Notification Gateway inicializado.');
  }

  /**
   * Maneja la conexión de un nuevo cliente.
   * Aquí puedes unir al cliente a una sala específica por su ID de usuario/doctor
   * para poder enviar mensajes dirigidos (ej: solo al doctor 123).
   */
  handleConnection(client: Socket, ...args: any[]) {
    console.log(` Cliente WebSocket conectado: ${client.id}`);
    
    // Ejemplo de cómo unir a una Sala (Room) usando el ID en el Query Params (Necesita autenticación JWT)
    // const userId = client.handshake.query.userId as string;
    // if (userId) {
    //     client.join(`user-${userId}`);
    //     console.log(`Cliente ${client.id} unido a la sala 'user-${userId}'`);
    // }
  }

  handleDisconnect(client: Socket) {
    console.log(` Cliente WebSocket desconectado: ${client.id}`);
  }
}