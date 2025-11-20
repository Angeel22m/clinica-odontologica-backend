import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RecordatorioService } from './recordatorio.service';

@Injectable()
export class RecordatorioCron {
  constructor(private recordatorioService: RecordatorioService) {}

  @Cron('0 * * * *') // cada 1 hora, exactamente en el minuto 0
  async ejecutarCron() {
    await this.recordatorioService.procesarRecordatorios();
  }
}
