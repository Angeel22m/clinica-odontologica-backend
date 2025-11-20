import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

@Injectable()
export class RecordatorioService {
  private emailTransporter;
  private whatsappClient: Twilio;

  constructor(private prisma: PrismaService) {

    // ----- CONFIGURAR EMAIL -----
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ----- CONFIGURAR WHATSAPP -----
    this.whatsappClient = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN,
    );
  }

  // ============================================================================
  // MÉTODO PRINCIPAL: se ejecuta con CRON
  // ============================================================================
  async procesarRecordatorios() {
    const ahora = new Date();

    // Consulta Prisma corregida para evitar TS2353 y TS2339
  const citas = await this.prisma.cita.findMany({
    where: { estado: 'PENDIENTE' },
    include: {
      paciente: true,
    },
  });

    for (const cita of citas) {
      // Convertir fecha (string) + hora (string) → Date real
      const fechaCompleta = new Date(`${cita.fecha}T${cita.hora}:00`);

      const diferenciaSeg = (fechaCompleta.getTime() - ahora.getTime()) / 1000;
      const horas = diferenciaSeg / 3600;

      // ===== RECORDATORIO 24 HORAS =====
      if (horas <= 24 && !cita.recordatorio24h) {
        await this.enviarRecordatorio(cita, fechaCompleta);
        await this.prisma.cita.update({
          where: { id: cita.id },
          data: { recordatorio24h: true },
        });
      }

      // ===== RECORDATORIO 1 HORA =====
      if (horas <= 1 && !cita.recordatorio1h) {
        await this.enviarRecordatorio(cita, fechaCompleta);
        await this.prisma.cita.update({
          where: { id: cita.id },
          data: { recordatorio1h: true },
        });
      }
    }
  }

  // ============================================================================
  // ENVIAR RECORDATORIO POR CORREO O WHATSAPP
  // ============================================================================
  async enviarRecordatorio(cita: any, fechaCompleta: Date) {
    const paciente = cita.paciente;

    const mensaje = `
Hola ${paciente.nombre},
Te recordamos que tienes una cita programada:

 Fecha: ${fechaCompleta.toLocaleDateString()}
 Hora: ${fechaCompleta.toLocaleTimeString()}

Clínica Odontológica
    `;

    // ----- EMAIL -----
    if (paciente.preferenciaNotificacion === 'email' ||
        paciente.preferenciaNotificacion === 'ambos') {
      await this.enviarCorreo(paciente.email, mensaje);
    }

    // ----- WHATSAPP -----
    if (paciente.preferenciaNotificacion === 'whatsapp' ||
        paciente.preferenciaNotificacion === 'ambos') {
      await this.enviarWhatsApp(paciente.telefono, mensaje);
    }
  }

  // ============================================================================
  // MÉTODOS UNITARIOS DE ENVÍO
  // ============================================================================
  async enviarCorreo(destinatario: string, mensaje: string) {
    await this.emailTransporter.sendMail({
      from: `"Clínica Odontológica" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Recordatorio de Cita',
      text: mensaje,
    });
  }

  async enviarWhatsApp(numero: string, mensaje: string) {
    await this.whatsappClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${numero}`,
      body: mensaje,
    });
  }
}
