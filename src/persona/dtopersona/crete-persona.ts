import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';


export class CreatePersonaDto {
  @ApiProperty({ description: 'Nombre de la persona' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido de la persona' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ description: 'DNI de la persona' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ description: 'Teléfono de la persona' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ description: 'Dirección de la persona' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ description: 'Fecha de nacimiento de la persona' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fechaNac: Date;
}
