import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateServiciosDto } from 'src/servicios/dto/create_servicios.dto';
import { identity } from 'rxjs';

@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

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
  findAll() {
    return this.citasService.findAll();
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
  @ApiOperation({summary: 'Obtener las citas pendientes de un doctor por id'})
  @ApiParam({name: 'id', type: Number})  
  getCitasForDoctor(@Param('id') id: number){

    return this.citasService.getCitasForDoctor(id);

  }
}
