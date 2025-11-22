import { Controller, Get, Patch, Body, BadRequestException, Param,Query } from "@nestjs/common";
import { ModificarInfoService } from "./modificarInfo.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateModificarInfoDto } from "./dtoModificar/update.modificarInfo";
import { JwtAuthGuard } from '../auth/guards/jwt.guard'; // Necesitas tu guard de autenticación
import { RolesGuard } from '../auth/roles.guard';         // Necesitas tu guard de roles
import { Roles } from '../auth/roles.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';


@ApiTags('Modificar')
@Controller('Modificar')
@UseGuards(JwtAuthGuard,RolesGuard)
export class ModificadorInfoController {
    constructor(private readonly modificadorInfoService: ModificarInfoService) {}

   // ============================
    // GET: Obtener usuario por Correo, DNI o Teléfono
    // ============================
    @Get('buscar') // Nueva ruta para ser más explícitos y usar Query
    @Roles('RECEPCIONISTA')
    @ApiResponse({ description: "Obtener el cliente por correo, DNI o teléfono" })
    @ApiResponse({ status: 200, description: "Cliente encontrado correctamente" })
    @ApiResponse({ status: 404, description: "El cliente no existe o el criterio es inválido" })
    async findOneByCriterion(
        @Query('tipo') tipo: string, // 'correo', 'dni', 'telefono'
        @Query('valor') valor: string  // El valor a buscar
    ) {
        if (!tipo || !valor) {
            throw new BadRequestException("Debe proporcionar un 'tipo' y un 'valor' para la búsqueda.");
        }

        let usuario;

        // 1. Lógica de selección del servicio basada en el tipo
        switch (tipo.toLowerCase()) {
            case 'correo':
                usuario = await this.modificadorInfoService.buscarPorCorreo(valor);
                break;
            case 'dni':
                usuario = await this.modificadorInfoService.buscarPorDni(valor);
                break;
            case 'telefono':
                usuario = await this.modificadorInfoService.buscarPorTelefono(valor);
                break;
            default:
                throw new BadRequestException(`Tipo de búsqueda '${tipo}' no soportado. Use 'correo', 'dni' o 'telefono'.`);
        }

        // 2. Manejo de respuesta (asumiendo que los métodos de servicio lanzan excepciones 404/400 si fallan)
        // **NOTA**: Si tu servicio lanza `NotFoundException` (como se recomendó antes),
        // no necesitas la verificación `if (!usuario)` aquí, NestJS lo maneja.

        return {
            message: `Cliente con ${tipo} ${valor} encontrado correctamente`,
            data: usuario,
        };
    }


    // ============================
    // PUT: Completar datos por correo
    // ============================
    @Patch(':correo')
    @Roles('RECEPCIONISTA')
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

