import { Global, Module } from '@nestjs/common';
import {NotificationService} from './notificaciones.service';
import { NotificationGateway } from './notificaciones.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global() // <-- hace que esté disponible en toda la app
@Module({

  imports: [JwtModule.register({
    secret: 'secret', // Asegúrate de usar el mismo secreto que en AuthModule
    signOptions: { expiresIn: '1h' },
  })],
  providers: [NotificationService,NotificationGateway],
  exports: [NotificationService,NotificationGateway], // <-- importante
})
export class NotificationModule {}
