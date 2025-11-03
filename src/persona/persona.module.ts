import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { PrismaModule } from 'prisma/prisma.module';


@Module({
  controllers: [PersonaController],
  providers: [PersonaService],
  imports: [PrismaModule],
})
export class PersonaModule {}
