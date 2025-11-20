import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
@WebSocketGateway({
  
  cors: {
   
    origin: 'http://localhost:5173', 
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  constructor(private jwtService: JwtService) {}
 
  getServer(): Server {
    return this.server;
  }

  // Métodos de ciclo de vida
  afterInit(server: Server) {
    console.log('Notification Gateway inicializado.');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    // Obtener el token de los query parameters
    const token = client.handshake.query.token as string;

    if (!token) {
      console.log(`Conexión rechazada: Token no proporcionado. ID: ${client.id}`);
      return client.disconnect(); // Desconectar si no hay token
    }

    try {
      // Verificar el token JWT. Usa tu secreto configurado en JwtModule.
      // El método 'verify' decodifica y valida la firma.
      const payload = await this.jwtService.verifyAsync(token);

      // Obtener el ID del usuario/doctor desde el payload verificado
      // Tu AuthService usa 'id' como clave para el ID de usuario.
      const userId = payload.id as number; 
      
      if (!userId) {
        throw new Error('Payload JWT no contiene ID de usuario válido.');
      }

      // Autenticación exitosa: Unir a la sala del usuario
      client.join(`user-${userId}`);
      
      console.log(`Cliente conectado y autenticado: ${client.id}`);
      console.log(` Cliente unido a la sala 'user-${userId}'`);

    } catch (error) {
      // Si la verificación falla (token inválido, expirado, o error de decodificación)
      console.log(`Conexión rechazada: Token no válido/expirado. ID: ${client.id}`);
      console.log(`Detalle del error: ${error.message}`);
      client.disconnect(); // Desconectar si el token es inválido
    }
  }

  handleDisconnect(client: Socket) {
    console.log(` Cliente WebSocket desconectado: ${client.id}`);
  }
}