// src/servicios/dto/update_servicios.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateServiciosDto } from './create_servicios.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiciosDto extends PartialType(CreateServiciosDto) {
  @ApiPropertyOptional({ description: 'Nombre del servicio' })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del servicio' })
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Precio del servicio' })
  precio?: number;

  @ApiPropertyOptional({ description: 'Estado del servicio' })
  activo?: boolean;
}
