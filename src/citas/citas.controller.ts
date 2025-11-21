import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Patch
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateServiciosDto } from 'src/servicios/dto/create_servicios.dto';
import { identity } from 'rxjs';
import { HorarioLaboral } from '../enums/enums';
import { Prisma } from '@prisma/client';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService
    
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo servicio.' })
  @ApiParam({ name: 'body', type: CreateServiciosDto })
  @ApiResponse({ status: 201, description: 'Servicio creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las citas.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas obtenida correctamente.',
  })
  @ApiResponse({ status: 404, description: 'No se encontraron citas.' })
  findAll(@Query('fecha') fecha?: string) {
    return this.citasService.findAll({fecha});
  }
  
  @Get('horarios')
  getHorarios() {
    return Object.values(HorarioLaboral)
  }

  @Get('doctores-disponibles')
  async getDoctoresDisponibles(@Query('fecha') fecha: string) {
    return this.citasService.getDoctoresDisponibles(fecha);
  }

  @Get('horas-disponibles')
  async getHorasDisponibles(
    @Query('doctorId') doctorId: string,
    @Query('fecha') fecha: string,
  ) {
      return this.citasService.getHorasDisponibles(Number(doctorId), fecha);
  }

  @Get('paciente/:pacienteId')
  async getCitasPorPaciente(
    @Param('pacienteId', ParseIntPipe) pacienteId: number
  ) {
    return this.citasService.getCitasPorPaciente(pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cita por ID.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cita obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una cita.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'body', type: UpdateCitaDto })
  @ApiResponse({
    status: 200,
    description: 'Cita actualizada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  update(@Param('id') id: number, @Body() UpdateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, UpdateCitaDto);
  }

  @Get('doctor/:id')
  @ApiOperation({summary: 'Obtener las citas de un doctor por id'})
  @ApiParam({name: 'id', type: Number})  
  getCitasForDoctor(@Param('id') id: number){

    return this.citasService.getCitasForDoctor(id);
  }
  
  @Patch(':id/cancelar')
  async cancelarCita(
    @Param('id') id: number,
  ) {
    // 1. Ejecutar la cancelación y esperar el objeto Cita
    // La Cita devuelta contiene 'id' y 'doctorId'.
    const citaCancelada = await this.citasService.cancelar(id);
    
   
    // 3. Devolver el resultado de la operación HTTP
    return citaCancelada;
  }


  @Patch(':id/confirmar')
@ApiOperation({ summary: 'Confirmar asistencia a una cita.' })
@ApiParam({ name: 'id', type: Number, description: 'ID de la cita a confirmar' })
@ApiResponse({ status: 200, description: 'Cita confirmada correctamente.' })
@ApiResponse({ status: 404, description: 'Cita no encontrada.' })
async confirmarCita(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.citasService.confirmar(id);
}

}
