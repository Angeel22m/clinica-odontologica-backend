import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateModificarInfoDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}][\p{L}\s'’-]{1,49}$/u, {
    message: 'El nombre solo puede contener letras, espacios y guiones.',
  })
  nombre?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[\p{L}][\p{L}\s'’-]{1,49}$/u, {
    message: 'El apellido solo puede contener letras, espacios y guiones.',
  })
  apellido?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?:\d{4}-\d{4}-\d{5}|\d{13})$/, {
    message: 'El DNI debe tener el formato ####-####-##### o 13 dígitos.',
  })
  dni?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?:\+?504[-\s]?)?(?:\d{8}|\d{4}[-\s]?\d{4})$/, {
    message:
      'El teléfono debe tener 8 dígitos o incluir el código de país (+504).',
  })
  telefono?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  direccion?: string;

  @IsDateString()
  @IsOptional()
  fechaNac?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message:
      'La contraseña debe incluir mayúscula, minúscula, número y carácter especial.',
  })
  password?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;
}
