import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS (para permitir peticiones desde el frontend)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite en desarrollo
      'http://localhost:3000', // opcional, si usas otra app local
      'https://tu-dominio-en-produccion.com', // para cuando despliegues el frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // para usar cookies o autenticación
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
