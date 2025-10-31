// src/servicios/dto/create_servicios.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiciosDto {
  @ApiProperty({ description: 'Nombre del servicio' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del servicio',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'Precio del servicio' })
  @IsInt()
  precio: number;

  @ApiPropertyOptional({ description: 'Estado del servicio', required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
