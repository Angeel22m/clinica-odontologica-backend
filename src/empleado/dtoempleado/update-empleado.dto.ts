import { PartialType } from "@nestjs/mapped-types";
import { CreateEmpleadoDto } from "./create-empleado.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Puesto, Rol } from '@prisma/client'; // ✅ Importa los enums correctos de Prisma
type Enum = Puesto; //  Define un alias de tipo para mayor claridad
type RolEnum = Rol; //  Alias para el enum Rol

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
 
 

    @ApiPropertyOptional({description: 'Nombre de la persona'})
    nombre?: string;

    @ApiPropertyOptional({description: 'Apellido de la persona'})
    apellido?: string;

    @ApiPropertyOptional({description: 'DNI de la persona'})
    dni?: string;

    @ApiPropertyOptional({description: 'Telefono de la persona'})
    telefono?: string;

    @ApiPropertyOptional({description: 'Dirreccion  de la persona'})
    direccion?: string; 

    @ApiPropertyOptional({description: 'Fecha de nacimiento de la persona'})
    fechaNac?: Date;

    @ApiPropertyOptional({description: 'Email de la persona'})
    correo?: string;

    @ApiPropertyOptional({description: 'Contraseña del usuario'})
    password?: string;

    @ApiPropertyOptional({description: 'Estado del empleado activo/inactivo'})
    activo?: boolean;
    @ApiPropertyOptional({description: 'Rol del empleado', enum: Rol })
    rol?: RolEnum;
    
    @ApiPropertyOptional({description: 'Puesto del Empleado'})
    puesto?: Enum;

    @ApiPropertyOptional({description: 'Fecha de contratacion del Empleado'})
    fechaIngreso?: Date;

    @ApiPropertyOptional({description: 'Salario del Empleado'})
    salario?: number;
}
