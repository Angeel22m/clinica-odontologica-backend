import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ModificarInfoService } from "./modificarInfo.service";
import { ModificadorInfoController } from "./modificarInfo.controller";


@Module({
    controllers:[ModificadorInfoController],
    providers:[ModificarInfoService],
    imports:[PrismaModule]

})
export class ModificarInfoModule{}
