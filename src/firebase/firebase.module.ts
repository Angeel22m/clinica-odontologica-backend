import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FirebaseService } from './firebase.service';
import { ConfigModule } from '@nestjs/config';
import { ExpedienteArchivoService } from './expediente-archivo.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [StorageService, FirebaseService, ExpedienteArchivoService],
  // 🔑 ¡CLAVE! Exportar los servicios que otros módulos consumirán.
  exports: [StorageService, ExpedienteArchivoService] 
})
export class FirebaseModule {}