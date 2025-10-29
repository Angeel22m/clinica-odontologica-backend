import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class HelloService {
  constructor(private prisma: PrismaService ) {}

  findAll (){
    return this.prisma.hello.findFirst();
  }
}


