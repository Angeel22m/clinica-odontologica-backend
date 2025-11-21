import { Test, TestingModule } from '@nestjs/testing';
import { RecordatorioService } from '../Recordatorio/recordatorio.service';
import { PrismaService } from '../prisma/prisma.service';
import sgMail from '@sendgrid/mail';
import Twilio from 'twilio';


// ===== MOCKS =====

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mocked-sid' }),
    },
  }));
});

// Mock Twilio
const twilioMock = {
  messages: {
    create: jest.fn(),
  },
};

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => twilioMock);
});

// Mock Prisma
const prismaMock = {
  cita: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

describe('RecordatorioService', () => {
  let service: RecordatorioService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordatorioService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RecordatorioService>(RecordatorioService);
  });

  // ========================================================
  //         TEST ENVÍO DE EMAIL (SendMail)
  // ========================================================
  it('Debe enviar correo con SendGrid', async () => {
    (sgMail.send as jest.Mock).mockResolvedValueOnce(true);

    const result = await service.SendMail(
      'test@correo.com',
      'Asunto de prueba',
      '<h1>Hola</h1>',
    );

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  // ========================================================
  //         TEST ENVÍO DE WHATSAPP
  // ========================================================
  it('Debe enviar WhatsApp con Twilio', async () => {
    twilioMock.messages.create.mockResolvedValueOnce({ sid: 'ABC123' });

    const result = await service.enviarWhatsApp(
      '+50499999999',
      'Mensaje de prueba',
    );

    expect(twilioMock.messages.create).toHaveBeenCalledTimes(1);
    expect(result.sid).toBe('ABC123');
  });

  // ========================================================
  //         TEST enviarRecordatorio
  // ========================================================
  it('Debe ejecutar enviarRecordatorio y llamar SendMail', async () => {
    // Mock SendGrid
    (sgMail.send as jest.Mock).mockResolvedValueOnce(true);

    const citaMock = {
      paciente: {
        nombre: 'Eduardo',
        user: { correo: 'eduardo@test.com' },
      },
      fecha: '2025-12-10',
      hora: '10:30',
    };

    const fecha = new Date('2025-12-10T10:30:00');

    await service.enviarRecordatorio(citaMock, fecha);

    expect(sgMail.send).toHaveBeenCalledTimes(1);
  });

  // ========================================================
  //         TEST procesarRecordatorios
  // ========================================================
  it('Debe procesar citas y disparar enviarRecordatorio', async () => {
    const enviarSpy = jest.spyOn(service, 'enviarRecordatorio')
                          .mockResolvedValueOnce(undefined);

    prismaMock.cita.findMany.mockResolvedValueOnce([
      {
        id: 1,
        fecha: '2025-12-20',
        hora: '08:00',
        estado: 'PENDIENTE',
        recordatorio24h: false,
        paciente: {
          nombre: 'Carlos',
          user: { correo: 'carlos@test.com' },
        },
      },
    ]);

    prismaMock.cita.update.mockResolvedValueOnce({});

    await service.procesarRecordatorios();

    expect(prismaMock.cita.findMany).toHaveBeenCalledTimes(1);
    expect(enviarSpy).toHaveBeenCalledTimes(1);
  });
});
