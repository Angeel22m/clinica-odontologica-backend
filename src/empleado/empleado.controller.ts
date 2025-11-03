import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe,Put } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './dtoempleado/create-empleado.dto';


@ApiTags('Empleado')
@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}
 

// Crear empleado
@Post()
@ApiResponse({ status: 201, description: 'Empleado creado correctamente' })
@ApiResponse({ status: 400, description: 'Error al crear el empleado' })
async create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
  const empleado = await this.empleadoService.createEmpleado(createEmpleadoDto);
  console.log('Empleado creado:', empleado);

  return {
    message: 'Empleado creado correctamente',
    data: empleado,
  };
}
// Obtener todos los empleados
@Get()
@ApiResponse({description: 'Obtener todos los empleados registrados'})
async findAll() {
  const empleados = await this.empleadoService.findAll();
  console.log('Empleados registrados:', empleados);
  return {
    message: 'Lista de empleados registrados',
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
@ApiResponse({ status: 200, description: 'Empleado actualizado correctamente' })
@ApiResponse({ status: 404, description: 'Empleado no encontrado' })
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateEmpleadoDto: CreateEmpleadoDto,
){
  const empleado = await this.empleadoService.updateEmpleado(id, updateEmpleadoDto);
  console.log(`Empleado con ID ${id} actualizado:`, empleado);
  return {
    message: `Empleado con ID ${id} actualizado correctamente`,
    data: empleado,
  }
}
}



