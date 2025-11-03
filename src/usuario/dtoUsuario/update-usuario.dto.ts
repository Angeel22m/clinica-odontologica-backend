import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateUsuarioDto } from "./create-usuario.dto";
import { Rol } from "@prisma/client";


export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
    @ApiPropertyOptional({ description: 'Correo del Usuario' })
    correo?: string;

    @ApiPropertyOptional({ description: 'Contraseña del Usuario' })
    password?: string;

    @ApiPropertyOptional({ description: 'Rol del Usuario' })
    rol?: Rol;

    @ApiPropertyOptional({ description: 'Estado del Usuario' })
    activo?: boolean;
}