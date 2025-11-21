import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import sgMail from '@sendgrid/mail';



@Injectable()
export class RecordatorioService {
  private whatsappClient: Twilio;

  constructor(private prisma: PrismaService) {

    //const sgMail = require('@sendgrid/mail')
    const key = process.env.SENGRID_API_KEY||'';
    sgMail.setApiKey(key);

    // ----- CONFIGURAR WHATSAPP -----
    this.whatsappClient = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN,
    );
  }

  async procesarRecordatorios() {
 // Consulta Prisma corregida para evitar TS2353 y TS2339
  const citas = await this.prisma.cita.findMany({
    where: { estado: 'PENDIENTE' },
    include: {
      paciente:{include:{user:{select:{correo:true}}}
    }
    },
  });

    for (const cita of citas) {
     
      const ahora = new Date();
      // Convertir fecha (string) + hora (string) → Date real
      const fechaCompleta = new Date(`${cita.fecha}T${cita.hora}`);
      const partes = cita.hora.split(":")
      const Hora = parseInt(partes[0],10)

      const MIN= parseInt(partes[0],10)
      ahora.setHours(Hora,MIN,0,0)
      
      const diferenciaSeg = (fechaCompleta.getTime() - ahora.getTime()) / 1000;
      const horas = diferenciaSeg / 3600;
      
      const horasReal = Math.floor(horas)
      // ===== RECORDATORIO 48 HORAS =====
      if (horasReal <= 48 && horasReal >= 47 && !cita.recordatorio24h) {
     
        await this.enviarRecordatorio(cita, fechaCompleta);
        await this.prisma.cita.update({
          where: { id: cita.id },
          data: { recordatorio24h: true },

        });
      }

    }
  }

  async enviarRecordatorio(cita: any, fechaCompleta: Date) {
    const paciente = cita.paciente;

  const mensaje = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recordatorio de Cita</title>

  <style>
    /* Estilos responsivos */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .card {
        padding: 20px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Contenedor principal -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" 
               style="background:white; border-radius:10px; overflow:hidden;">

          <!-- Encabezado -->
          <tr>
            <td style="background:#4CAF50; padding:25px; text-align:center; color:white;">
              <h1 style="margin:0; font-size:24px;">Clínica Odontológica Identiclinic</h1>
            </td>
          </tr>

          <!-- Cuerpo del mensaje -->
          <tr>
            <td class="card" style="padding:30px; font-size:16px; color:#333;">

              <p>Hola <strong>${paciente.nombre}</strong>,</p>

              <p style="line-height:1.6;">
                Te recordamos que tienes una cita programada con nosotros.
              </p>

              <!-- Tarjeta con los datos de la cita -->
              <div style="
                background:#f0f9f0;
                padding:20px;
                border-radius:8px;
                margin:20px 0;
                border-left:5px solid #4CAF50;
              ">
                <p style="margin:0;">
                  <strong>📅 Fecha:</strong> ${cita.fecha}
                </p>
                <p style="margin:5px 0 0;">
                  <strong>⏰ Hora:</strong> ${cita.hora}
                </p>
              </div>

              <p style="line-height:1.6;">
                Si necesitas reprogramar o cancelar tu cita, puedes comunicarte con nosotros.
              </p>

              <p style="margin-top:30px;">
                Gracias por confiar en <strong>Identiclinic</strong> 🦷✨
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#eeeeee;
              padding:15px;
              text-align:center;
              font-size:12px;
              color:#555;
            ">
              Clínica Odontológica Identiclinic<br>
              © 2025 Todos los derechos reservados
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

    `;
    console.log("se llama SendMail");
    await this.SendMail(paciente.user.correo, "Recordatorio de cita", mensaje)

  }

async SendMail(to:string, subject:string, html:string){

    const msg ={
        to,
        from:{
          name: "Clínica Odontológica Identiclini",
          email: "eduardomejia66ee@gmail.com"
        },
        subject,
        html,
    };
    try {
        await sgMail.send(msg)
        console.log("Mensaje Enviado")
        return {success:true, message:"Correo enviado"}
        
    } catch (error) {
        console.error(error.message)
        throw new Error("Error al enviar el correo")
    }
    }

  async enviarWhatsApp(numero: string, mensaje: string) {
  try {
    console.log('Enviando WhatsApp a:', numero);

    const response = await this.whatsappClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${numero}`,
      body: mensaje,
    });

    console.log('WhatsApp enviado:', response.sid);
    return response;
  } catch (error) {
    console.error('Error al enviar WhatsApp:', error);
    throw error;
  }
}

}

