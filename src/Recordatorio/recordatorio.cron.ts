import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RecordatorioService } from './recordatorio.service';

@Injectable()
export class RecordatorioCron {
  constructor(private recordatorioService: RecordatorioService) {}

  @Cron('* * * * *') // cada 1 minuto
  async ejecutarCron() {
    await this.recordatorioService.procesarRecordatorios();
  }
}
