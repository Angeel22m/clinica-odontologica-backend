import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, BadRequestException } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dtoempleado/create-empleado.dto';
import { UpdateEmpleadoDto } from './dtoempleado/update-empleado.dto';



@ApiTags('Empleado')
@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}
 

// Crear empleado
// src/empleado/empleado.controller.ts
@Post()
@ApiResponse({ status: 201, description: 'Persona, empleado y usuario creados correctamente' })
@ApiResponse({ status: 400, description: 'Error al crear los registros' })
async create(@Body() dto: CreateEmpleadoDto) {
  try {
    const result = await this.empleadoService.createEmpleado(dto);
    console.log('Persona, empleado y usuario creados:', result);

    return {
      message: 'Persona, empleado y usuario creados correctamente',
      data: result,
    };
  } catch (error) {
    console.error('Error al crear persona/empleado/usuario:', error);
    throw new BadRequestException('Error al crear persona, empleado o usuario');
  }
}


// Obtener todos los empleados (con Persona y Usuario)
@Get()
@ApiResponse({ description: 'Obtener todos los empleados registrados con sus datos personales y de usuario' })
async findAll() {
  const empleados = await this.empleadoService.findAllCompleto();
  console.log('Empleados registrados (completos):', empleados);

  return {
    message: 'Lista de empleados registrados (con persona y usuario)',
    data: empleados,
  };
}

// Obtener un empleado por ID
@Get(':id')
@ApiResponse({ description: 'Obtener un empleado por ID' })
@ApiResponse({ status: 200, description: 'Empleado encontrado correctamente' })
@ApiResponse({ status: 404, description: 'Empleado no encontrado' })
async findOne(@Param('id', ParseIntPipe) id: number) {
  const empleado = await this.empleadoService['prisma'].empleado.findUnique({
    where: { id },
});
  if (!empleado) {
    return {
      message: `Empleado con ID ${id} no encontrado`,
    };
  }
  console.log(`Empleado con ID ${id} encontrado:`, empleado);
  return {
    message: `Empleado con ID ${id} encontrado correctamente`,
    data: empleado,
  };
}

// Actualizar empleado
@Put(':id')
@ApiResponse({ status: 200, description: 'Persona, empleado y usuario actualizados correctamente' })
@ApiResponse({ status: 404, description: 'Empleado no encontrado' })
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() UpdateEmpleadoDto: UpdateEmpleadoDto, // reutilizamos el DTO combinado
) {
  try {
    const empleado = await this.empleadoService.UpdateEmpleado(id, UpdateEmpleadoDto);
    console.log(`Empleado con ID ${id} actualizado junto con su persona y usuario:`, empleado);

    return {
      message: `Empleado con ID ${id} actualizado correctamente (incluye persona y usuario)`,
      data: empleado,
    };
  } catch (error) {
    console.error('Error al actualizar empleado/usuario/persona:', error);
    throw new BadRequestException('Error al actualizar el empleado, usuario o persona');
  }
}



}


