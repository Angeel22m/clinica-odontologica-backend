import { Injectable,OnModuleDestroy,OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService ) {}

}
