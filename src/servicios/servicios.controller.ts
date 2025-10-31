import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServiciosDto } from './dto/create_servicios.dto';
import { UpdateServiciosDto } from './dto/update_servicios.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios obtenida correctamente.',
  })
  @ApiResponse({ status: 404, description: 'No se encontraron servicios.' })
  findAll() {
    return this.serviciosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID.' })
  @ApiResponse({ status: 200, description: 'Servicio obtenido correctamente.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo servicio.' })
  @ApiResponse({ status: 201, description: 'Servicio creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() CreateServiciosDto: CreateServiciosDto) {
    return this.serviciosService.createServicio(CreateServiciosDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  update(
    @Param('id') id: number,
    @Body() UpdateServiciosDto: UpdateServiciosDto,
  ) {
    return this.serviciosService.updateServicio(+id, UpdateServiciosDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio eliminado correctamente.',
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.deleteServicio(id);
  }
}
