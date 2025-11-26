import { Module, Global } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from "@nestjs/schedule";
import { EmailVerificationService } from "./correo-verificacion.service";
import { EmailVerificationController } from "./correo-verificacion.controller";

@Global()
@Module({
    providers:[EmailVerificationService],

    imports:[PrismaModule, ConfigModule.forRoot(),
        ScheduleModule.forRoot(),
    
        ClientsModule.register([
            {
              
                name: 'MAIL_SERVICE', 
                transport: Transport.RMQ,
                options: {
                    // URL de tu servidor RabbitMQ
                 urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'], 
                     
                    // Nombre de la cola (debe coincidir con el Consumidor)
                    queue: 'email_queue', 
                    queueOptions: {
                        durable: true
                    },
                },
            },
        ])
    ],
    controllers:[EmailVerificationController],    
    exports:[EmailVerificationService]

})
export class CorreoVerificacion{}
