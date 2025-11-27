import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CitasConfirmadasDto {
    // Los path parameters siempre llegan como strings.
    // Usamos @Type para transformarlos en números antes de validar.
    
    @Type(() => Number) // <-- Transforma el string a Number
    @IsNotEmpty()
    @IsInt() // <-- Asegura que sea un entero después de la transformación
    pacienteId: number;

    @Type(() => Number) // <-- Transforma el string a Number
    @IsNotEmpty()
    @IsInt() // <-- Asegura que sea un entero después de la transformación
    doctorId: number;
}