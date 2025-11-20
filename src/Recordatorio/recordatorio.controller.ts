import { Controller, Get, Query } from '@nestjs/common';
import { RecordatorioService } from './recordatorio.service';

@Controller('whatsapp-test')
export class WhatsAppTestController {
  constructor(private readonly recordatorioService: RecordatorioService) {}

  @Get('enviar')
  async enviarMensajePrueba(
    @Query('numero') numero: string,
    @Query('mensaje') mensaje: string,
  ) {
    if (!numero) return 'Debes enviar ?numero=+504XXXXXXXX';
    if (!mensaje) return 'Debes enviar ?mensaje=Hola mundo';

    await this.recordatorioService.enviarWhatsApp(numero, mensaje);

    return `Mensaje enviado correctamente al número: ${numero}`;
  }
}
