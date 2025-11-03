import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsNumber, IsDate, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Puesto } from '@prisma/client'; //  Importa el enum

export class CreateEmpleadoDto {


// Tabla Empleado


  @ApiProperty({description: 'Estado del empleado'})
  @IsBoolean()
  @IsNotEmpty()
  activo: boolean;

 @ApiProperty({
    description: 'Puesto del empleado',
    enum: Puesto, // Swagger mostrará las opciones válidas
  })
  @IsEnum(Puesto)
  @IsNotEmpty()
  puesto: Puesto; // usa el tipo enum, no string

  @ApiProperty({description: 'Salario del empleado'})
  @IsNumber()
  @IsNotEmpty()
  salario: number;

  @ApiProperty({description: 'Fecha de ingreso del empleado'})
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fechaIngreso: Date;

  @ApiProperty({description: 'ID de la persona asociada al empleado'})
  @IsInt()
  @IsNotEmpty()
  personaId: number;

 

}
