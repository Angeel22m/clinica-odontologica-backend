// src/servicios/dto/create_servicios.dto.ts
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiciosDto {
  @ApiProperty({ description: 'Nombre del servicio' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del servicio',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  descripcion?: string;

  @ApiProperty({ description: 'Precio del servicio' })
  @IsInt()
  precio: number;

  @ApiPropertyOptional({ description: 'Estado del servicio', required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ 
    description: 'IDs de las especialidades asociadas al servicio',
    type: [Number], // Documentación para Swagger
    example: [1, 5]
  })
  @IsArray() // Debe ser un array
  @IsNumber({}, { each: true, message: 'Cada elemento en especialidadIds debe ser un número entero' }) // Cada elemento del array debe ser un número
  @ArrayMinSize(1, { message: 'Se debe seleccionar al menos una especialidad para el servicio.' }) // Asegura que se envíe al menos un ID
  especialidadIds: number[];
}
