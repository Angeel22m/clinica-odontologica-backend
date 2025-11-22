// src/Recordatorio/recordatorio.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices'; 
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordatorioService {
 

  constructor(
    private prisma: PrismaService,
    // Inyectamos el cliente de RabbitMQ configurado en el módulo
    @Inject('SCHEDULER_QUEUE_SERVICE') private readonly client: ClientProxy, 
  ) {}

  async procesarRecordatorios() {
    console.log('--- DB: Buscando citas para recordatorio...');
    
  
    const citas = await this.prisma.cita.findMany({
      where: { 
        estado: 'PENDIENTE',
        recordatorio24h: false // Solo buscamos las NO enviadas
      },
      include: {
        paciente: { include: { user: { select: { correo: true } } } },
      },
    });
    
    console.log(`--- DB: Encontradas ${citas.length} citas para procesar.`);

    for (const cita of citas) {
     
      const ahora = new Date();
      const fechaCompleta = new Date(`${cita.fecha}T${cita.hora}`);
      const partes = cita.hora.split(":")
  
      const Hora = parseInt(partes[0],10)
      const MIN= parseInt(partes[1],10)
      ahora.setHours(Hora,MIN,0,0) 

      const diferenciaSeg = (fechaCompleta.getTime() - ahora.getTime()) / 1000;
      const horas = diferenciaSeg / 3600;
      const horasReal = Math.floor(horas)
    

      if (horasReal <= 48 && horasReal >= 47) {
        
        console.log(`-> Delegando cita ${cita.id} a RabbitMQ.`);
        
        const jobData = {
          citaId: cita.id,
          destinatario: cita.paciente.user?.correo,
          nombrePaciente: cita.paciente.nombre,
          fecha: cita.fecha,
          hora: cita.hora
          
        };
        console.log('--- Emitting to RabbitMQ:', jobData);
        this.client.emit('send_recordatorio', jobData); 

        await this.prisma.cita.update({
          where: { id: cita.id },
          data: { recordatorio24h: true },
        });
      }
    }
  }

 
}