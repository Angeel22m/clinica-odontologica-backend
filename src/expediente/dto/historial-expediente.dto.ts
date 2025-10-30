// src/expediente/dto/historial-expediente.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class HistorialArchivoDto {
  @ApiProperty()
  nombreArchivo: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ required: false })
  tipoArchivo?: string;

  @ApiProperty({ required: false })
  creadoPor?: string;
}

export class HistorialDetalleDto {
  @ApiProperty()
  fecha: Date;

  @ApiProperty({ required: false })
  motivo?: string;

  @ApiProperty({ required: false })
  diagnostico?: string;

  @ApiProperty({ required: false })
  tratamiento?: string;

  @ApiProperty({ required: false })
  planTratamiento?: string;

  @ApiProperty({ required: false })
  doctorNombre?: string;

  @ApiProperty({ type: [HistorialArchivoDto], required: false })
  archivos?: HistorialArchivoDto[];
}
