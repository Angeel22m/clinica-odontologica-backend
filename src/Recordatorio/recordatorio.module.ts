import { Module, Global } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RecordatorioService } from "./recordatorio.service";
import { RecordatorioCron } from "./recordatorio.cron";





@Global()
@Module({
    controllers :[],
    providers:[RecordatorioService, RecordatorioCron],
    imports:[PrismaModule],


})
export class RecordatorioModule{}

