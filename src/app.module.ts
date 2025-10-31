import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ServiciosModule } from './servicios/servicios.module';

@Module({
  imports: [EmpleadoModule, ServiciosModule],
})
export class AppModule {}
