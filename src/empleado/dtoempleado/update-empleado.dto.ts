import { PartialType } from "@nestjs/mapped-types";
import { CreateEmpleadoDto } from "./create-empleado.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Puesto, Rol } from '@prisma/client'; // ✅ Importa los enums correctos de Prisma
type Enum = Puesto; //  Define un alias de tipo para mayor claridad
type RolEnum = Rol; //  Alias para el enum Rol

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
 
}
