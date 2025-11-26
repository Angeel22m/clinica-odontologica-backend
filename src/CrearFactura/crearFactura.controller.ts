import { Controller, Post, Body, Res, Get, Param,Query } from '@nestjs/common';
import { FacturaService } from '../CrearFactura/crearFactura.service';
import { CreateFacturaDto } from '../CrearFactura/dto/create-Facturacion';

@Controller('factura')
export class FacturaController {

  constructor(private readonly facturaService: FacturaService) {}

@Get('preview')
async getFacturaPreview(@Query('citaId') citaId: string) {
  return this.facturaService.obtenerFacturaPorCitaId(Number(citaId));
}

@Get("Citas")
async getBuscarcita(@Query("pacienteId") pacienteId:number){
   return this.facturaService.BuscarCita(Number(pacienteId));
}

@Post()
async crearFactura(@Query("citaId") citaId: number, @Res() res) {

  const pdf = await this.facturaService.crearFacturaPDFKit(citaId);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=factura.pdf',
  });

  res.send(pdf);
}

}
