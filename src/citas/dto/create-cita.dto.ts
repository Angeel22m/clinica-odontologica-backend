import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt } from 'class-validator';

export class CreateCitaDto {
  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' },
  )
  fecha: string;

  @ApiProperty({
    description: 'ID del paciente asociado a la cita',
    example: 1,
  })
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  pacienteId: number;

  @ApiProperty({
    description: 'ID del doctor que atenderá la cita',
    example: 2,
  })
  @IsInt({ message: 'El ID del doctor debe ser un número entero' })
  doctorId: number;

  @ApiProperty({
    description: 'ID del servicio clínico solicitado',
    example: 3,
  })
  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  servicioId: number;
}
