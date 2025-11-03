import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaDto } from './crete-persona';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {
    
    @ApiPropertyOptional({ description: 'Nombre de la persona' })
    nombre?: string;
    
    @ApiPropertyOptional({ description: 'Apellido de la persona' })
    apellido?: string;
    
    @ApiPropertyOptional({ description: 'DNI de la persona' })
    dni?: string;

    @ApiPropertyOptional({ description: 'Teléfono de la persona' })
    telefono?: string;

    @ApiPropertyOptional({ description: 'Dirección de la persona' })
    direccion?: string;

    @ApiPropertyOptional({ description: 'Fecha de nacimiento de la persona' })
    fechaNac?: Date;
}