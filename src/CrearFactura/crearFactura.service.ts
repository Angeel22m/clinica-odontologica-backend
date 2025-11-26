import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFacturaDto } from '../CrearFactura/dto/create-Facturacion';

@Injectable()
export class FacturaService {
  constructor(private prisma: PrismaService) {}

  async crearFacturaPDFKit(citaId: number): Promise<Buffer> {

    // ===========================================================
    // 1. VALIDACIÓN DEL DTO
    // ===========================================================
    if (!citaId || citaId <= 0) {
      throw new BadRequestException('Debe enviar un citaId válido y mayor a 0.');
    }

    // ===========================================================
    // 2. OBTENER CITA + RELACIONES NECESARIAS
    // ===========================================================
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        paciente: true,
        doctor: { include: { persona: true } },
        servicio: true,
        factura: { include: { detalles: true } } // <- corregido
      }
    });

    if (!cita) throw new NotFoundException(`No existe una cita con ID ${citaId}`);

    // ===========================================================
    // SI LA CITA YA ESTÁ FACTURADA → SOLO GENERAR PDF
    // ===========================================================
    if (cita.factura?.id) {
      return this.generarPDF(cita.factura, cita);
    }

    // ===========================================================
    // 3. VALIDAR PACIENTE
    // ===========================================================
    if (!cita.paciente || !cita.paciente.nombre || !cita.paciente.apellido)
      throw new BadRequestException('El paciente no tiene nombre completo.');
    if (!cita.paciente.dni)
      throw new BadRequestException('El paciente no tiene un DNI registrado.');

    const nombrePaciente = `${cita.paciente.nombre} ${cita.paciente.apellido}`;
    const dniPaciente = cita.paciente.dni;

    // ===========================================================
    // 4. VALIDAR DOCTOR
    // ===========================================================
    if (!cita.doctor || !cita.doctor.persona)
      throw new BadRequestException('El doctor no tiene datos de persona asociados.');

    const nombreDoctor = `${cita.doctor.persona.nombre} ${cita.doctor.persona.apellido}`;

    // ===========================================================
    // 5. VALIDAR SERVICIO
    // ===========================================================
    if (!cita.servicio || !cita.servicio.descripcion)
      throw new BadRequestException('El servicio no tiene descripción válida.');

    if (!cita.servicio.precio || cita.servicio.precio <= 0)
      throw new BadRequestException('El servicio no tiene un precio válido.');

    const items = [
      {
        descripcion: cita.servicio.descripcion,
        cantidad: 1,
        precio: cita.servicio.precio
      }
    ];

    // ===========================================================
    // 6. CALCULAR TOTALES
    // ===========================================================
    const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const isv15 = subtotal * 0.15;
    const total = subtotal + isv15;

    // ===========================================================
    // 7. GUARDAR FACTURA EN BD
    // ===========================================================
    const factura = await this.prisma.factura.create({
      data: {
        updatedAt: new Date(),
        numeroFactura: `FAC-${Date.now()}`,
        cai: "XXXXXXXXXXXX",
        fechaEmision: new Date(),
        pacienteId: cita.pacienteId,
        doctorId: cita.doctorId,
        citaId: cita.id,
        subtotal,
        isv15,
        totalPagar: total
      }
    });

    // ===========================================================
    // 8. GUARDAR DETALLES FACTURA
    // ===========================================================
    await this.prisma.detalleFactura.createMany({
      data: items.map(item => ({
        facturaId: factura.id,
        servicioId: cita.servicioId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        totalLinea: item.precio * item.cantidad,
        aplicaISV: true,
        updatedAt: new Date()
      }))
    });

    // ===========================================================
    // 9. RECARGAR FACTURA CON DETALLES
    // ===========================================================
    const facturaCompleta = await this.prisma.factura.findUnique({
      where: { id: factura.id },
      include: { detalles: true } // <- corregido
    });

    // ===========================================================
    // 11. GENERAR PDF
    // ===========================================================
    return this.generarPDF(facturaCompleta, cita);
  }

  private generarPDF(factura: any, cita: any): Promise<Buffer> {
    return new Promise(resolve => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // ENCABEZADO
      doc.fontSize(22).fillColor('#6B66A6')
        .text('CLÍNICA ODONTOLÓGICA', { align: 'center' })
        .moveDown(2);

      // DATOS DEL PACIENTE
      doc.fontSize(12).fillColor('black')
        .text(`Nombre del paciente: ${cita.paciente?.nombre ?? ''} ${cita.paciente?.apellido ?? ''}`)
        .moveDown(0.3)
        .text(`DNI del paciente: ${cita.paciente?.dni ?? ''}`)
        .moveDown(0.3)
        .text(`Doctor: ${cita.doctor?.persona?.nombre ?? ''} ${cita.doctor?.persona?.apellido ?? ''}`)
        .moveDown(1);

      const rightY = doc.y - 65;

      // DATOS FACTURA
      doc.fontSize(12)
        .text(`FACTURA N.º: ${factura?.numeroFactura ?? ''}`, 350, rightY)
        .text(`Fecha de emisión: ${factura?.fechaEmision ? new Date(factura.fechaEmision).toLocaleDateString() : ''}`, 350)
        .text(`CAI: ${factura?.cai ?? ''}`, 350)
        .moveDown(2);

      // TABLA DETALLE
      doc.fontSize(12).fillColor('#6B66A6')
        .text('Descripción', 50, doc.y, { continued: true })
        .text('Cantidad', 260, doc.y, { continued: true })
        .text('Precio', 340, doc.y, { continued: true })
        .text('Total', 430)
        .moveDown(0.5);

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      (factura?.detalles ?? []).forEach(item => {
        doc.fontSize(11).fillColor('black')
          .text(item.descripcion ?? '', 50, doc.y, { width: 200 })
          .text((item.cantidad ?? 0).toString(), 260, doc.y)
          .text(`L. ${Number(item.precioUnitario ?? item.precio ?? 0).toFixed(2)}`, 340, doc.y)
          .text(`L. ${Number(item.totalLinea ?? 0).toFixed(2)}`, 430)
          .moveDown(0.8);
      });

      doc.moveDown(1);

      // TOTALES
      doc.fontSize(11).fillColor('black')
        .text(`SUBTOTAL:`, 350)
        .text(`ISV 15%:`, 350)
        .font('Helvetica-Bold')
        .text(`TOTAL A PAGAR:`, 350)
        .font('Helvetica')
        .text(`L. ${Number(factura?.subtotal ?? 0).toFixed(2)}`, 480)
        .text(`L. ${Number(factura?.isv15 ?? 0).toFixed(2)}`, 480)
        .font('Helvetica-Bold')
        .text(`L. ${Number(factura?.totalPagar ?? 0).toFixed(2)}`, 480);

      doc.end();
    });
  }

  // Método para buscar la cita facturable por paciente
  async BuscarCita(pacienteId: number) {

    // 1. Validar ID del paciente
    if (!pacienteId || pacienteId <= 0) {
      throw new BadRequestException('Debe enviar un ID de paciente válido.');
    }

    // 2. Buscar paciente + citas facturables
    const persona = await this.prisma.persona.findUnique({
      where: { id: pacienteId },
      include: {
        citas: {
          where: {
            factura: null, // <- corregido
            estado: 'COMPLETADA'
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    // 3. Validar que el paciente exista
    if (!persona) {
      throw new NotFoundException(`No existe un paciente con el ID ${pacienteId}.`);
    }

    // 4. Validar que tenga citas facturables
    if (!persona.citas || persona.citas.length === 0) {
      throw new NotFoundException(
        `El paciente con ID ${pacienteId} no tiene citas completadas y sin factura.`
      );
    }

    // 5. Retornar SOLO las citas del include — lo que pediste
    return persona.citas;
  }

  // obtener la informacion del paciente para mostrarlo en el front 
  async obtenerFacturaPorCitaId(citaId: number) {

    // 1. Validar ID de cita
    if (!citaId || citaId <= 0) {
      throw new BadRequestException('Debe enviar un ID de cita válido.');
    }

    // 2. Buscar cita COMPLETADA y sin factura
    const cita = await this.prisma.cita.findFirst({
      where: {
        id: citaId,
        estado: 'COMPLETADA',    // El estado exacto de tu enum
        factura: null            // <- corregido
      },
      include: {
        paciente: true,
        doctor: { include: { persona: true } },
        servicio: true,
        factura: true // <- corregido
      }
    });

    // Validaciones
    if (!cita) {
      throw new NotFoundException(
        `La cita con ID ${citaId} no existe, no está completada o ya fue facturada.`
      );
    }

    if (!cita.paciente) {
      throw new BadRequestException('La cita no tiene paciente asociado.');
    }

    if (!cita.doctor) {
      throw new BadRequestException('La cita no tiene doctor asociado.');
    }

    if (!cita.servicio) {
      throw new BadRequestException('La cita no tiene un servicio asignado.');
    }

    // Preparar datos
    const datos = {
      citaId: cita.id,
      nombrePaciente: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
      dniPaciente: cita.paciente.dni,
      nombreDoctor: `${cita.doctor.persona.nombre} ${cita.doctor.persona.apellido}`,
      fecha: cita.fecha,
      hora: cita.hora,
      servicio: {
        descripcion: cita.servicio.descripcion,
        cantidad: 1,
        precio: cita.servicio.precio,
        total: cita.servicio.precio * 1
      },
      totales: {
        subtotal: cita.servicio.precio,
        isv15: cita.servicio.precio * 0.15,
        total: cita.servicio.precio * 1.15
      }
    };

    return datos;
  }

}
