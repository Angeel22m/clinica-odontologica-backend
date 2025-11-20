import { Global, Module } from '@nestjs/common';
import {NotificationService} from './notificaciones.service';
import { NotificationGateway } from './notificaciones.gateway';

@Global() // <-- hace que esté disponible en toda la app
@Module({
  providers: [NotificationService,NotificationGateway],
  exports: [NotificationService,NotificationGateway], // <-- importante
})
export class NotificationModule {}
