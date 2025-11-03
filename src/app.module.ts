import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EmpleadoModule, ServiciosModule, ExpedienteModule, FirebaseModule, AuthModule],
})
export class AppModule {}
