import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validaciones globales (necesario para class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si se envían campos no permitidos
      transform: true, // transforma los tipos automáticamente (ej. string → number)
    }),
  );
  
  // Lista de orígenes permitidos en desarrollo local
  const allowedOrigins = [
    'http://localhost',      // El frontend sin puerto (implica puerto 80)
    'http://localhost:80',   // Frontend explícitamente en puerto 80
    'http://localhost:3000', // Posible origen si el frontend estuviera en 3000
    'http://localhost:5173', // Puerto común para Vite
    'http://localhost:8080', // Puerto común para otros servidores de desarrollo
    // Agrega cualquier otro puerto que uses para el frontend (ej. 5173 para Vite, 4200 para Angular, etc.)
  ];

  // Habilitar CORS (para permitir peticiones desde el frontend)
  app.enableCors({
    // Permite los orígenes definidos arriba
    origin: allowedOrigins,
    
    // Métodos HTTP permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    
    // Cabeceras permitidas (si el frontend envía cabeceras personalizadas)
    // Dejar vacío o con 'Content-Type, Accept' suele ser suficiente
    // allowedHeaders: 'Content-Type, Accept, Authorization', 

    // Necesario si usas cookies, sesiones o tokens de autenticación
    credentials: true, 
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}`);
}
bootstrap();
