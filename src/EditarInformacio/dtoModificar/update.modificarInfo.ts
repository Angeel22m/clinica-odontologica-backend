import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional, ApiPropertyOptions } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";


export class UpdateModificarInfoDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    dni?: string
    
    @IsString()
    @IsOptional()
    telefono?: string

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    fechaNac?: Date;

    @IsString()
    @IsOptional()
    password?: string

  
}