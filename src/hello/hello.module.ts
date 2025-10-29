import { Module } from '@nestjs/common';
import { HelloService } from './hello.service';
import { PrismaModule } from 'prisma/prisma.module';
import { HelloController } from './hello.controller';


@Module({
  
  imports: [PrismaModule],
  providers: [HelloService],
  controllers: [HelloController],
  
})
export class HelloModule {}
