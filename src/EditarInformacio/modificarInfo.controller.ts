import { Controller, Get, Put, Body, BadRequestException, Param } from "@nestjs/common";
import { ModificarInfoService } from "./modificarInfo.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateModificarInfoDto } from "./dtoModificar/update.modificarInfo";

@ApiTags('Modificar')
@Controller('Modificar')
export class ModificadorInfoController {
    constructor(private readonly modificadorInfoService: ModificarInfoService) {}

    // ============================
    // GET: Obtener usuario por correo
    // ============================
    @Get(':correo')
    @ApiResponse({ description: "Obtener el cliente por su correo" })
    @ApiResponse({ status: 200, description: "Cliente encontrado correctamente" })
    @ApiResponse({ status: 404, description: "El cliente no existe" })
    async findOne(@Param('correo') correo: string) {

        const usuario = await this.modificadorInfoService.buscarPorCorreo(correo);

        if (!usuario) {
            return {
                message: `Cliente con correo ${correo} no encontrado`,
            };
        }

        return {
            message: `Cliente con correo ${correo} encontrado correctamente`,
            data: usuario,
        };
    }


    // ============================
    // PUT: Completar datos por correo
    // ============================
    @Put(':correo')
    @ApiResponse({ status: 200, description: "Datos del paciente completados o actualizados correctamente" })
    @ApiResponse({ status: 404, description: "Paciente no encontrado" })
    async completarPorCorreo(
        @Param('correo') correo: string,
        @Body() data: UpdateModificarInfoDto,
    ) {
        try {
            return await this.modificadorInfoService.completarDatosPorCorreo(correo, data);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}

