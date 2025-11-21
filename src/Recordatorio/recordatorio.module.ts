import { Module, Global } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RecordatorioService } from "./recordatorio.service";
import { RecordatorioCron } from "./recordatorio.cron";
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    providers:[RecordatorioService, RecordatorioCron],
    imports:[PrismaModule, ConfigModule.forRoot()],    
})
export class RecordatorioModule{}

