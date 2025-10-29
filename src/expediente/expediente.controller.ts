import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('expediente')

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo expediente' })
  @ApiResponse({ status: 201, description: 'Expediente creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los expedientes' })
  @ApiResponse({ status: 200, description: 'Lista de expedientes obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron expedientes.' })
  findAll() {
    return this.expedienteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente obtenido correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 findOne(@Param('id') id: string) {
    return this.expedienteService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 update(@Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(+id, updateExpedienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
  remove(@Param('id') id: string) {
    return this.expedienteService.remove(+id);
  }
}
