import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile,BadRequestException,Req,UseGuards } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { CreateExpedienteDetalleDto } from './dto/create-expdiente-detalle.dtp';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { HistorialDetalleDto } from './dto/historial-expediente.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../firebase/storage.service';
import { ExpedienteArchivoService } from '../firebase/expediente-archivo.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard'; // Necesitas tu guard de autenticación
import { RolesGuard } from '../auth/roles.guard';         // Necesitas tu guard de roles
import { Roles } from '../auth/roles.decorator';           //  Necesitas tu decorador @Roles
import { get } from 'http';


@ApiTags('expediente')

@Controller('expediente')
//@UseGuards(JwtAuthGuard, RolesGuard) // Aplica los guards a todo el controlador
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService,
              private storageService: StorageService,
              private expedienteArchivoService: ExpedienteArchivoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo expediente' })
  @ApiResponse({ status: 201, description: 'Expediente creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedienteService.create(createExpedienteDto);
  }

  @Get()
  //@Roles("CLIENTE")
  @ApiOperation({ summary: 'Obtener todos los expedientes' })
  @ApiResponse({ status: 200, description: 'Lista de expedientes obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron expedientes.' })
  findAll() {
    return this.expedienteService.findAll();
  }

  @Get(':id')
  //@Roles("CLIENTE")
  @ApiOperation({ summary: 'Obtener un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente obtenido correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 findOne(@Param('id') id: Number) {
    return this.expedienteService.findOne(+id);
  }

    @Get('paciente/:id')
  //@Roles("CLIENTE")
  @ApiOperation({ summary: 'Obtener un expediente por ID del paciente' })
  @ApiResponse({ status: 200, description: 'Expediente obtenido correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 getExpedientePorIdPacientes(@Param('id') id: Number) {
    return this.expedienteService.findOne(+id,true);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 update(@Param('id') id: Number, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(+id, updateExpedienteDto);
  }
// ======================================================================
// DELETE: ELIMINAR UN EXPEDIENTE POR ID
// ======================================================================
/*
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
  remove(@Param('id') id: Number) {
    return this.expedienteService.remove(+id); 
  }*/
// ======================================================================
// GET: OBTIENTE UN HISTORIAL DE EXPEDIENTE DETALLE POR ID DEL PACIENTE
// ======================================================================

  @Get('historial/:pacienteId')
  @ApiParam({ name: 'pacienteId', type: Number })
  @ApiResponse({ status: 200, description: 'Historial obtenido correctamente', type: [HistorialDetalleDto] })
  @ApiResponse({ status: 404, description: 'No se encontró historial para este paciente' })
  async getHistorial(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.expedienteService.getHistorialPaciente(pacienteId);
  }

  // ======================================================================
  // POST: SUBIR ARCHIVO Y CREAR UN REGISTRO EN LA BASE DE DATOS
  // ======================================================================


  @Post('archivo/upload')
  @ApiParam({ name: 'file', type: 'file', description: 'Archivo a subir' })
  @ApiResponse({ status: 201, description: 'Archivo subido y registrado correctamente.' })
  @ApiResponse({ status: 400, description: 'Error en la subida del archivo.' })
  @Roles('ADMIN', 'DOCTOR') // Define qué roles pueden subir
  @UseInterceptors(FileInterceptor('file')) // 'file' debe coincidir con la KEY en Postman/Frontend
  async upload(
    @UploadedFile() file: Express.Multer.File,
    // Asumimos que envías el ID del expediente y el ID del creador en el body
    @Body('expedienteId', ParseIntPipe) expedienteId: number,
    @Body('creadoPorId', ParseIntPipe) creadoPorId: number, // Si no lo obtienes del token
    // @Req() req: any // Si el creadoPorId viene del token: const creadoPorId = req.user.id;
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo para la subida.');
    }

    // El StorageService maneja la subida a Firebase y la creación del registro en Prisma
    const result = await this.storageService.uploadFile(
      file,
      expedienteId,
      creadoPorId,
    );

    return {
      message: 'Archivo subido y registrado con éxito.',
      dbId: result.dbId,
      // Retorna la URL TEMPORAL solo para que el cliente que subió vea una confirmación inmediata
      signedUrl: result.signedUrl, 
    };
  }

  // =======================================================================
  // DELETE: ELIMINAR ARCHIVO (Eliminar de Firebase y Prisma)
  // =======================================================================
  @Delete('archivo/:id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Archivo eliminado correctamente de Firebase y Prisma.' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado.' })
  //@Roles('ADMIN') // Normalmente, solo un admin puede eliminar permanentemente
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    // El StorageService maneja la lógica dual: elimina de Firebase y luego de Prisma
    return this.storageService.deleteFile(id);
  }


  //===========================================================================
  // GET: OBTENER LOS EXPEDIENTES DE SUS PACIENTES COMO DOCTOR
  //===========================================================================

  @Get('doctor/:id')

  async obtenerExpedinetesPorDoctor(@Param('id',ParseIntPipe) id: number){
    return this.expedienteService.getExpedientesPorDoctor(id);
  }



  @Post('detalle/:expedienteId') // <--- Ruta específica para el POST del detalle
  @ApiOperation({ summary: 'Crea un nuevo detalle para un expediente existente.' })
  @ApiResponse({ status: 201, description: 'Detalle creado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El expediente o doctor no existe.' })
  @ApiResponse({ status: 400, description: 'Conflicto de IDs entre la ruta y el cuerpo.' })
  async crearDetalle(
    @Param('expedienteId', ParseIntPipe) expedienteId: number, // ID del expediente (del path)
    @Body() data: CreateExpedienteDetalleDto, // Datos del nuevo detalle (del body)
  ) {
  
    if (data.expedienteId !== expedienteId) {
      throw new BadRequestException(
        `El 'expedienteId' en la ruta (${expedienteId}) no coincide con el 'expedienteId' en el cuerpo (${data.expedienteId}).`,
      );
    }
    
    // 2. Llamar al servicio, pasando el DTO
    // La lógica de verificar existencia de Expediente y Doctor está en el servicio.
    const nuevoDetalle = await this.expedienteService.crearExpedienteDetalle(
      data,
    );

    return {
      message: 'Detalle de expediente creado exitosamente.',
      data: nuevoDetalle,
    };
  }


}
