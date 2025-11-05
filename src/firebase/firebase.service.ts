// src/firebase/firebase.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    try {
      const jsonPath = path.resolve(__dirname, '../../keys/clinica-files-firebase-adminsdk-fbsvc-bae11eddaa.json');
      let credential: admin.ServiceAccount | undefined;

      if (fs.existsSync(jsonPath)) {
        this.logger.log('✅ Usando credenciales Firebase desde archivo local');
        credential = require(jsonPath);
      } else if (process.env.FIREBASE_CREDENTIALS) {
        this.logger.log('✅ Usando credenciales Firebase desde variable de entorno');
        credential = JSON.parse(process.env.FIREBASE_CREDENTIALS);
      } else {
        throw new Error('❌ No se encontró el archivo Firebase ni la variable FIREBASE_CREDENTIALS.');
      }

      const bucketName = process.env.FIREBASE_BUCKET;
      if (!bucketName) {
        throw new Error('❌ Variable FIREBASE_BUCKET no definida o vacía.');
      }

      if (!credential) {
        throw new Error('❌ Credenciales de Firebase no encontradas.');
      }

      this.logger.log(`🔥 Inicializando Firebase con bucket: ${bucketName}`);

      admin.initializeApp({
        credential: admin.credential.cert(credential),
        storageBucket: bucketName,
      });

      this.logger.log('✅ Firebase inicializado correctamente.');
    } catch (err) {
      this.logger.error(`Error al inicializar Firebase: ${err.message}`);
      throw err;
    }
  }

  getBucket() {
    return admin.storage().bucket();
  }
}


