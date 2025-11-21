import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { CitasModule } from './citas/citas.module';
import 'dotenv/config';
import { ModificarInfoModule } from './EditarInformacio/modificarInfo.Module';
import { NotificationModule } from './notificaciones/notificaciones.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecordatorioModule } from './Recordatorio/recordatorio.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    EmpleadoModule,
    ExpedienteModule,
    ServiciosModule,
    FirebaseModule,
    AuthModule,
    CitasModule,
    ModificarInfoModule,
    NotificationModule,
    PrismaModule,
    RecordatorioModule,
    ScheduleModule.forRoot(),
    
  ],
})
export class AppModule {}

