// src/firebase/firebase.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage'; 
import { ServiceAccount } from 'firebase-admin'; // Importamos el tipo para mejor claridad

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket; 

  onModuleInit() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    // 1. Verificar si la clave existe (medida de seguridad)
    if (!serviceAccountJson) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY no está definida en las variables de entorno.");
    }
    
    // 2. Parsear la cadena JSON a un objeto que Firebase-Admin necesita
    let serviceAccount: ServiceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY no es un JSON válido.");
    }

    // 3. Inicializar usando el objeto parseado
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    this.bucket = admin.storage().bucket();
    console.log('Firebase Admin SDK inicializado.');
  }

  getBucket(): Bucket {
    return this.bucket;
  }
}