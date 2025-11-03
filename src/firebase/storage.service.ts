import { Injectable, InternalServerErrorException, BadRequestException, HttpException} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ExpedienteArchivoService } from '../firebase/expediente-archivo.service'; // 🔑 Importar el nuevo servicio
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// Define la estructura de la respuesta de subida
interface UploadResult {
    storageName: string;
    filePath: string;
    signedUrl: string; // URL temporal de confirmación
    dbId?: number; // ID del registro en Prisma
}

@Injectable()
export class StorageService {
    constructor(
        private readonly firebaseService: FirebaseService,
        // 🔑 Inyectar el servicio de Prisma
        private readonly expedienteArchivoService: ExpedienteArchivoService, 
    ) {}

    // =======================================================================================
    // 🔑 1. MÉTODO DE SUBIDA (POST)
    // =======================================================================================
    async uploadFile(
        file: Express.Multer.File, 
        expedienteId: number, 
        creadoPorId: number
    ): Promise<UploadResult> {
        await this.expedienteArchivoService.validateFks(expedienteId, creadoPorId);
        const bucket = this.firebaseService.getBucket();
        
        // 1. Validaciones... (manteniendo tu lógica)
        const allowedMimeTypes = ['image/png', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Tipo de archivo no permitido. Solo PNG y PDF.');
        }

        // 2. Generar nombres y rutas
        const fileExtension = path.extname(file.originalname);
        const storageName = `${uuidv4()}${fileExtension}`;
        const filePath = `archivos/${storageName}`; // Ruta permanente
        const fileUpload = bucket.file(filePath);

        return new Promise((resolve, reject) => {
            const blobStream = fileUpload.createWriteStream({
                resumable: false,
                metadata: { contentType: file.mimetype },
            });

            blobStream.on('error', (error) => {
                console.error('Error al subir a Firebase:', error);
                reject(new InternalServerErrorException('Error interno al subir el archivo.'));
            });

            blobStream.on('finish', async () => {
                try {
                    // 3. Generar URL Firmada (TEMPORAL) para la respuesta inmediata al POST
                    const urlConfig = {
                        action: 'read' as const,
                        expires: Date.now() + 1000 * 60 * 60, // 1 hora
                    };
                    const [signedUrl] = await fileUpload.getSignedUrl(urlConfig);
                    
                    // 4. 🔑 GUARDAR METADATA EN PRISMA
                    const fileRecord = await this.expedienteArchivoService.create({
                        expedienteId: expedienteId,
                        nombreArchivo: file.originalname,
                        storageName: storageName,
                        filePath: filePath, // ⬅️ Guardamos la ruta permanente (la clave)
                        tipoArchivo: file.mimetype,
                        creadoPorId: creadoPorId, 
                    });

                    // 5. Resolver la promesa con los datos del registro y la URL temporal
                    resolve({ 
                        storageName: storageName, 
                        filePath: filePath, 
                        signedUrl: signedUrl, 
                        dbId: fileRecord.id 
                    });
                } catch (error) {
                    console.error('Error al guardar registro o generar URL:', error);
                    
                    // 🔑 SOLUCIÓN: Verifica si es un error HTTP controlado (404, etc.)
                    // Asegúrate de importar HttpException en la parte superior del archivo.
                    if (error instanceof HttpException) {
                        // Relanza el error 404 (o 400), que es lo que debe ver Postman
                        reject(error);
                    } else {
                        // Cualquier otro error desconocido lo manejamos como 500.
                        reject(new InternalServerErrorException('Error al finalizar el proceso de subida.'));
                    }
            }});
            blobStream.end(file.buffer);
        });
    }

    // =======================================================================================
    // 🔑 2. MÉTODO PARA GENERAR URL FIRMADA (GET)
    // =======================================================================================
    async generateSignedUrl(filePath: string): Promise<string> {
        const bucket = this.firebaseService.getBucket();
        const file = bucket.file(filePath);
        
        // La URL expira en 1 hora (ajusta esto según tus políticas de seguridad)
        const [url] = await file.getSignedUrl({
            action: 'read',
            // expire en 60 seconds
            expires: Date.now() + 3000 // 
        });
        
        return url;
    }

    // =======================================================================================
    // 🔑 3. MÉTODO DE ELIMINACIÓN (DELETE)
    // =======================================================================================
    async deleteFile(id: number): Promise<{ success: boolean, message: string }> {
        // 1. Obtener la metadata para saber qué eliminar de la nube
        const fileRecord = await this.expedienteArchivoService.findOne(id); 
        
        // 2. Eliminar el archivo del Bucket de Firebase usando la ruta
        const bucket = this.firebaseService.getBucket();
        await bucket.file(fileRecord.filePath).delete(); 

        // 3. Eliminar el registro de Prisma
        await this.expedienteArchivoService.delete(id); 

        return { success: true, message: `Archivo y registro ${id} eliminados.` };
    }
}