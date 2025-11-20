import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { WhatsAppTestController } from "./recordatorio.controller";
import { RecordatorioService } from "./recordatorio.service";
import { Prisma } from "@prisma/client";

@Module({
    controllers :[WhatsAppTestController],
    providers:[RecordatorioService],
    imports:[PrismaModule]

})
export class RecordatorioModule{}

