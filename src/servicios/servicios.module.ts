import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiciosController } from './servicios.controller';

@Module({
  imports: [PrismaModule],
  providers: [ServiciosService],
  controllers: [ServiciosController],
})
export class ServiciosModule {}
