// src/expediente/dto/create-expediente.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExpedienteDto {
  @IsInt()
  pacienteId: number;

  @IsInt()
  doctorId: number;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  enfermedades?: string;

  @IsOptional()
  @IsString()
  medicamentos?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
