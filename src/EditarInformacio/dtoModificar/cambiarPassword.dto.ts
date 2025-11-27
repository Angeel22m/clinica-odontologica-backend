import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarPasswordDto {
  @IsString()
  @ApiProperty()
  passwordActual: string;

  @IsString()
  @ApiProperty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message:
      'La contraseña debe incluir mayúscula, minúscula, número y carácter especial.',
  })
  passwordNueva: string;
}
