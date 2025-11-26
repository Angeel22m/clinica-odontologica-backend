import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { FacturasService } from "./historialF.service";
import { FacturaController } from "./historialF.controller";


@Module({
    controllers:[FacturaController],
    providers:[FacturasService],
    imports:[PrismaModule]

})
export class HistorialFacturaModule{}


