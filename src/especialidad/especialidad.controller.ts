import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  ParseIntPipe
} from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';

// Aplicamos la etiqueta principal
@ApiTags('Especialidades')
@Controller('especialidad')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  // ----------------------------------------------------
  // POST /especialidad
  // ----------------------------------------------------
  @Post()
  @ApiOperation({ summary: 'Crea una nueva especialidad' })
  @ApiResponse({ status: 201, description: 'Especialidad creada con éxito.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadService.create(createEspecialidadDto);
  }

  // ----------------------------------------------------
  // GET /especialidad
  // ----------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Obtiene todas las especialidades disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de especialidades.' })
  findAll() {
    return this.especialidadService.findAll();
  }

  // ----------------------------------------------------
  // GET /especialidad/:id
  // ----------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una especialidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la especialidad a buscar', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidad encontrada.' })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.findOne(id);
  }

  // ----------------------------------------------------
  // PATCH /especialidad/:id
  // ----------------------------------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza campos de una especialidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la especialidad a actualizar', example: 1 })
  @ApiBody({ type: UpdateEspecialidadDto, description: 'Campos a actualizar' })
  @ApiResponse({ status: 200, description: 'Especialidad actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada.' })
  @ApiResponse({ status: 400, description: 'ID o cuerpo de solicitud inválido.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateEspecialidadDto: UpdateEspecialidadDto
  ) {
    return this.especialidadService.update(id, updateEspecialidadDto);
  }

  // ----------------------------------------------------
  // DELETE /especialidad/:id
  // ----------------------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una especialidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la especialidad a eliminar', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidad eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadService.remove(id);
  }
}