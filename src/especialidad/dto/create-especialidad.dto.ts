import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateEspecialidadDto {

    @ApiProperty({
        description: 'Nombre de la especialidad',
        example: 'Ortodoncia'
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la especialidad no puede estar vacío' })
    nombre: string;

    @ApiProperty({
        description: 'Descripción detallada de la especialidad (Opcional)',
        example: 'Diagnóstico y tratamiento de enfermedades del corazón.',
        required: false // Indica en Swagger que es opcional
    })
    @IsOptional() // Permite que el campo sea omitido
    @IsString()
    descripcion?: string; // El '?' indica que es opcional en TypeScript
}