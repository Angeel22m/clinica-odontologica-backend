import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile,BadRequestException,Req } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { HistorialDetalleDto } from './dto/historial-expediente.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../firebase/storage.service';
import { ExpedienteArchivoService } from '../firebase/expediente-archivo.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 🔑 Necesitas tu guard de autenticación
// import { RolesGuard } from '../auth/roles.guard';         // 🔑 Necesitas tu guard de roles
// import { Roles } from '../auth/roles.decorator';           // 🔑 Necesitas tu decorador @Roles


@ApiTags('expediente')

@Controller('expediente')
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
 findOne(@Param('id') id: Number) {
    return this.expedienteService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
 update(@Param('id') id: Number, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(+id, updateExpedienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un expediente por ID' })
  @ApiResponse({ status: 200, description: 'Expediente eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado.' })
  remove(@Param('id') id: Number) {
    return this.expedienteService.remove(+id);
  }

  @Get('historial/:pacienteId')
  @ApiParam({ name: 'pacienteId', type: Number })
  @ApiResponse({ status: 200, description: 'Historial obtenido correctamente', type: [HistorialDetalleDto] })
  @ApiResponse({ status: 404, description: 'No se encontró historial para este paciente' })
  async getHistorial(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.expedienteService.getHistorialPaciente(pacienteId);
  }

  @Post('archivo/upload')
  // @Roles('admin', 'medico') // 🔑 Define qué roles pueden subir
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
  // 2. GET: OBTENER ARCHIVOS POR EXPEDIENTE (Genera URLs temporales)
  // URL: GET /expediente-archivos/expediente/123
  // =======================================================================
  @Get('archivo/:expedienteId')
  // @Roles('admin', 'medico', 'enfermero') // 🔑 Define qué roles pueden ver
  async getFilesByExpediente(
    @Param('expedienteId', ParseIntPipe) expedienteId: number,
  ) {
    // 1. Obtener los metadatos de Prisma (solo el filePath, no la URL antigua)
    const archivos = await this.expedienteArchivoService.findByExpediente(
      expedienteId,
    );

    // 2. Generar una URL firmada NUEVA y TEMPORAL para cada archivo
    const archivosConUrl = await Promise.all(
      archivos.map(async (archivo) => {
        // Usamos el filePath (la clave guardada) para generar la URL
        const signedUrl = await this.storageService.generateSignedUrl(
          archivo.filePath,
        );
        
        // Retornamos el objeto, añadiendo la URL temporal (que no se guardará en la DB)
        return {
          ...archivo,
          signedUrl: signedUrl, // ⬅️ URL válida solo por 1 hora (o lo que hayas configurado)
        };
      }),
    );

    return archivosConUrl;
  }

  // =======================================================================
  // 3. DELETE: ELIMINAR ARCHIVO (Eliminar de Firebase y Prisma)
  // URL: DELETE /expediente-archivos/5
  // =======================================================================
  @Delete('archivo/:id')
  // @Roles('admin') // 🔑 Normalmente, solo un admin puede eliminar permanentemente
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    // El StorageService maneja la lógica dual: elimina de Firebase y luego de Prisma
    return this.storageService.deleteFile(id);
  }

}
