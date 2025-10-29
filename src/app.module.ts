import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';




@Module({
  imports: [HelloModule, EmpleadoModule, ExpedienteModule],
})
export class AppModule {}
