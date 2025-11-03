import { IsString,IsEmail, IsOptional,IsNotEmpty,IsEnum, IsInt, IsBoolean  } from "class-validator";
import { ApiPropertyOptional,ApiProperty, } from "@nestjs/swagger";
import { Rol } from '@prisma/client'; //  Importa el enum


export class CreateUsuarioDto {
    // tabla usuario
  @ApiProperty({description: 'Correo del usuario'})
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({description: 'Contraseña del usuario'})
  @IsString()
  @IsNotEmpty()
  password: string;

    @ApiProperty({
      description: 'Rol del usuario',
      enum: Rol, // Swagger mostrará las opciones válidas
    })
    @IsEnum(Rol)
    @IsNotEmpty()
    rol: Rol; // usa el tipo enum, no string


    @ApiPropertyOptional({description: 'Estado del usuario'})
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @ApiProperty({description: 'ID de la persona asociada al Usuario'})
     @IsInt()
     @IsNotEmpty()
     personaId: number;
}
