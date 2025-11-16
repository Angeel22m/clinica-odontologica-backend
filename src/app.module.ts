import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { CitasModule } from './citas/citas.module';
import 'dotenv/config';
import { ModificarInfoModule } from './EditarInformacio/modificarInfo.Module';



@Module({
  imports: [
    EmpleadoModule,
    ExpedienteModule,
    ServiciosModule,
    FirebaseModule,
    AuthModule,
    CitasModule,
    ModificarInfoModule
    
  ],
})
export class AppModule {}

