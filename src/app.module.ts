import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';




@Module({
  imports: [ EmpleadoModule, ExpedienteModule],
})
export class AppModule {}
