import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmpleadoModule } from './empleado/empleado.module';



@Module({
  imports: [HelloModule, EmpleadoModule],
})
export class AppModule {}
