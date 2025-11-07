import { Module } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [EmpleadoController],
  providers: [EmpleadoService],
  imports: [PrismaModule],
})
export class EmpleadoModule {}
