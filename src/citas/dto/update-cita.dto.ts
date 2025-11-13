import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
  @ApiPropertyOptional({ description: 'Fecha de la cita' })
  fecha?: string;

  @ApiPropertyOptional({ description: 'Paciente asociado a la cita' })
  pacienteId?: number;

  @ApiPropertyOptional({ description: 'Doctor asociado a la cita' })
  doctorId?: number;

  @ApiPropertyOptional({ description: 'Servicio asociado a la cita' })
  servicioId?: number;
}
