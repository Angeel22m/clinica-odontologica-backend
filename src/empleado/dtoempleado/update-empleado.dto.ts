import { PartialType } from "@nestjs/mapped-types";
import { CreateEmpleadoDto } from "./create-empleado.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Puesto } from '@prisma/client'; // ✅ Importa el enum correcto de Prisma
type Enum = Puesto; // ✅ Define un alias de tipo para mayor claridad

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
 
    @ApiPropertyOptional({description: 'Id de la persona ' })
    personaId?: number;

    @ApiPropertyOptional({description: 'Nombre de la persona'})
    nombre?: string;

    @ApiPropertyOptional({description: 'Apellido de la persona'})
    apellido?: string;

    @ApiPropertyOptional({description: 'DNI de la persona'})
    dni?: number;

    @ApiPropertyOptional({description: 'Telefono de la persona'})
    telefono?: number;

    @ApiPropertyOptional({description: 'Dirreccion  de la persona'})
    direccion?: string; 

    @ApiPropertyOptional({description: 'Fecha de nacimiento de la persona'})
    fechaNacimiento?: Date;

    @ApiPropertyOptional({description: 'Id del usuario'})
    usuarioId?: number;

    @ApiPropertyOptional({description: 'Email de la persona'})
    email?: string;

    @ApiPropertyOptional({description: 'Contraseña del usuario'})
    password?: string;

    @ApiPropertyOptional({description: 'Estado del empleado activo/inactivo'})
    activo?: boolean;

    @ApiPropertyOptional({description: 'Rol del empleado'})
    rol?: string;

    @ApiPropertyOptional({description: 'Id del Empleado'})
    empleadoId?: number;

    @ApiPropertyOptional({description: 'Puesto del Empleado'})
    puesto?: Enum;

    @ApiPropertyOptional({description: 'Fecha de contratacion del Empleado'})
    fechaInicio?: Date;

    @ApiPropertyOptional({description: 'Salario del Empleado'})
    salario?: number;
}
