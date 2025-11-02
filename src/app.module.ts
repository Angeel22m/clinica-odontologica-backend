import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EmpleadoModule, ServiciosModule, ExpedienteModule, AuthModule],
})
export class AppModule {}
