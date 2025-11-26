import { Module } from "@nestjs/common";
import { FacturaController } from "./crearFactura.controller";
import { FacturaService } from "./crearFactura.service";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaModule } from "src/prisma/prisma.module";


@Module({
controllers:[FacturaController],
providers: [FacturaService],
imports:[PrismaModule]
})
export class CrearFacturaModule{}
