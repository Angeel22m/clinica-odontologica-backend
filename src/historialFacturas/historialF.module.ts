import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import {  HistorialFacturaService } from "./historialF.service";
import { HistorialFacturaController } from "./historialF.controller";


@Module({
    controllers:[HistorialFacturaController],
    providers:[HistorialFacturaService],
    imports:[PrismaModule]

})
export class HistorialFacturaModule{}


