import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
  imports: [PrismaModule,FirebaseModule],
})
export class ExpedienteModule {}
