// src/empleado/dtoempleado/create-empleado-usuario.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Puesto } from '@prisma/client'; // o de tu enum local
import { Rol } from '@prisma/client';    // o de tu enum local

export class CreateEmpleadoDto {
  // Datos de la Persona
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


  // Datos del Empleado
  @ApiProperty({ description: 'Estado del empleado' })
  @IsBoolean()
  @IsNotEmpty()
  activo: boolean;

  @ApiProperty({
    description: 'Puesto del empleado',
    enum: Puesto,
  })
  @IsEnum(Puesto)
  @IsNotEmpty()
  puesto: Puesto;

  @ApiProperty({ description: 'Salario del empleado' })
  @IsNumber()
  @IsNotEmpty()
  salario: number;

  @ApiProperty({ description: 'Fecha de ingreso del empleado' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fechaIngreso: Date;


  // Datos del Usuario
  @ApiProperty({ description: 'Correo del usuario' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: Rol,
  })
  @IsEnum(Rol)
  @IsNotEmpty()
  rol: Rol;

  @ApiPropertyOptional({ description: 'Estado del usuario' })
  @IsOptional()
  @IsBoolean()
  usuarioActivo?: boolean;
}
