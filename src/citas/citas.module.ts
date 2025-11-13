import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
