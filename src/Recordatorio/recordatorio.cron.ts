import { Injectable } from '@nestjs/common';
import {  Interval } from '@nestjs/schedule';
import { RecordatorioService } from './recordatorio.service';

@Injectable()
export class RecordatorioCron {
  constructor(private recordatorioService: RecordatorioService) {}

  //@Interval(5000) // cada 1 minuto
  //@Interval(1000*60)
  async ejecutarCron() {
    //await this.recordatorioService.procesarRecordatorios();
  }
}

