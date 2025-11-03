// src/auth/dto/auth.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
  @IsOptional()
  @IsEmail({})
  correo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\d{4}-\d{4}-\d{5}|\d{13})$/, {
    message: 'El DNI debe tener el formato ####-####-##### o 13 dígitos.',
  })
  dni?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+?504[-\s]?)?(?:\d{8}|\d{4}[-\s]?\d{4})$/, {
    message:
      'El teléfono debe tener 8 dígitos o incluir el código de país (+504).',
  })
  telefono?: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una letra y un número.',
  })
  password: string;
}
