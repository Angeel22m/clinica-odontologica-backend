import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteDto } from './create-expediente.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {

      @ApiPropertyOptional({ description: 'ID del paciente' })
  pacienteId?: number;

  @ApiPropertyOptional({ description: 'ID del doctor' })
  doctorId?: number;

  @ApiPropertyOptional({ description: 'Alergias del paciente' })
  alergias?: string;

  @ApiPropertyOptional({ description: 'Enfermedades del paciente' })
  enfermedades?: string;

  @ApiPropertyOptional({ description: 'Medicamentos que toma el paciente' })
  medicamentos?: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  observaciones?: string;
}
