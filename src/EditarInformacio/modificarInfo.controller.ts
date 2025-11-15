import { Controller, Get, Post, Body, Put, BadRequestException, Param, Req } from "@nestjs/common";
import { ModificarInfoService } from "./modificarInfo.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateModificarInfoDto } from "./dtoModificar/update.modificarInfo";
import { UserInfo } from "firebase-admin/auth";


@ApiTags('Modificar')
@Controller('Modificar')
export class ModificadorInfoController {
    constructor (private readonly modificadorInfoService: ModificarInfoService){}

    //encontra el usuario por correo con un get
    @Get('correo')
    @ApiResponse({description: "Obtener el cliente por su correo"})
    @ApiResponse({status:200, description:"Cliente encontrado correctamente"})
    @ApiResponse({status:404, description: "el Cleinte no existe"})
    async findOne(@Param('correo')correo:string){
        const modificarInfo = await this.completarPorCorreo["Prisma"].user.findUnique({
            where:{correo},
        });
        if (!UserInfo){
            return{
              message:  `Empleado con Correo ${correo} no encontrado`,  
            };
        }

        return{
        message: `Empleado con Correo ${correo} encontrado correctamente`,
        data: UserInfo,
        }
    }


   // modificar los datos dle usuario ya existente  con un put 
    @Put('correo')
    @ApiResponse({status:200, description: "Los datos del paciente se han completado o actualizado Correctamente"})
    @ApiResponse({status:404, description: "Paciente no encontrado"})
    async completarPorCorreo(
        @Param('correo') correo: string,
        @Body() UpdateModificarInfoDto: UpdateModificarInfoDto,
    ){
        try{
            const modificarInfo = await this.modificadorInfoService.completarDatosPorCorreo(correo, UpdateModificarInfoDto);
            return this.modificadorInfoService.completarDatosPorCorreo(correo, UpdateModificarInfoDto);
        }catch (error){
            throw new BadRequestException(error.message);
        }
    }
}    

