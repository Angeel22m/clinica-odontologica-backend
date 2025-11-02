// src/auth/dto/auth.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString()
  correo: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  password: string;
}
