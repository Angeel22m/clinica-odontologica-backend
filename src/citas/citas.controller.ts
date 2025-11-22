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
import { JwtAuthGuard } from '../auth/guards/jwt.guard'; // Necesitas tu guard de autenticación
import { RolesGuard } from '../auth/roles.guard';         // Necesitas tu guard de roles
import { Roles } from '../auth/roles.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
 

@Controller('citas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService
    
  ) {}



  // create cita

  @Post()
  @Roles('RECEPCIONISTA', 'CLIENTE')
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
  

  //get para obtener los horarios disponibles
  @Get('horarios')
  @Roles('CLIENTE',"RECEPCIONISTA")
  getHorarios() {
    return Object.values(HorarioLaboral)
  }


  
  @Get('doctores-disponibles')
  @Roles('CLIENTE',"RECEPCIONISTA")
  async getDoctoresDisponibles(@Query('fecha') fecha: string) {
    return this.citasService.getDoctoresDisponibles(fecha);
  }

  @Get('horas-disponibles')
  @Roles('CLIENTE',"RECEPCIONISTA")
  async getHorasDisponibles(
    @Query('doctorId') doctorId: string,
    @Query('fecha') fecha: string,
  ) {
      return this.citasService.getHorasDisponibles(Number(doctorId), fecha);
  }
 
  // CITAS POR PACIENTE
  @Get('paciente/:pacienteId')
  @Roles('CLIENTE', 'RECEPCIONISTA')
  async getCitasPorPaciente(
    @Param('pacienteId', ParseIntPipe) pacienteId: number
  ) {
    return this.citasService.getCitasPorPaciente(pacienteId);
  }


  // GET: OBTENER UNA CITA POR ID

  @Get(':id')
  @Roles('CLIENTE',"RECEPCIONISTA")
  @ApiOperation({ summary: 'Obtener una cita por ID.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cita obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  @Put(':id')
  @Roles('RECEPCIONISTA',"CLIENTE")
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
  @Roles('DOCTOR')
  @ApiOperation({summary: 'Obtener las citas de un doctor por id'})
  @ApiParam({name: 'id', type: Number})  
  getCitasForDoctor(@Param('id') id: number){

    return this.citasService.getCitasForDoctor(id);
  }
  

  @Patch(':id/cancelar')
  @Roles('CLIENTE',"RECEPCIONISTA")
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
  @Roles('CLIENTE',"RECEPCIONISTA")
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
