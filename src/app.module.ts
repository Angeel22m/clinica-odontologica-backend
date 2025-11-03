import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [EmpleadoModule, ServiciosModule, ExpedienteModule, FirebaseModule],
})
export class AppModule {}
