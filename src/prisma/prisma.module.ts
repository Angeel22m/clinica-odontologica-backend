import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <-- hace que esté disponible en toda la app
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- importante
})
export class PrismaModule {}
