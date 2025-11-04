// src/firebase/firebase.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { Bucket } from '@google-cloud/storage'; 

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket; 

  onModuleInit() {
    // CORRECCIÓN: Usar process.cwd() para la ruta raíz
    const serviceAccountPath = path.join(
      process.cwd(), 
      'keys', 
      'clinica-files-firebase-adminsdk-fbsvc-bae11eddaa.json' 
    ); 
    
    const serviceAccount = require(serviceAccountPath); 

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    this.bucket = admin.storage().bucket();
    console.log('Firebase Admin SDK inicializado.');
  }

  // ¡MÉTODO FALTANTE REINSERTADO!
  getBucket(): Bucket {
    return this.bucket;
  }
}