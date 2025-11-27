import { IsInt, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';


export class HistorialCancelaDto {
    // Los path parameters siempre llegan como strings.
    // Usamos @Type para transformarlos en números antes de validar.
    

    @IsNotEmpty()
    @IsString() // <-- Asegura que sea un entero después de la transformación
    motivoCancelacion: string;


    @IsNotEmpty()
    @IsInt() // <-- Asegura que sea un entero después de la transformación
    usuarioCancelaId: number;
    @IsString()
    @IsNotEmpty()
    rolCancela: 'ADMIN' | 'DOCTOR' | 'RECEPCIONISTA' | 'CLIENTE';
}