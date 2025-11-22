// src/auth/dto/auth.dto.ts
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
  @IsEmail({})
  correo: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()  
  password: string;
}
