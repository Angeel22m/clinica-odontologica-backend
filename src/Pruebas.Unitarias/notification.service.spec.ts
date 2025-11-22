import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notificaciones/notificaciones.service';
import { NotificationGateway } from '../notificaciones/notificaciones.gateway';

describe('NotificationService', () => {
  let service: NotificationService;
  let gatewayMock: any;
  let serverMock: any;

  beforeEach(async () => {
    // Mock del servidor Socket.io
    serverMock = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(), // permite chaining .to().emit()
    };

    // Mock del Gateway
    gatewayMock = {
      getServer: jest.fn().mockReturnValue(serverMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationGateway, useValue: gatewayMock },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  //                            TEST notifyAll()
  // ----------------------------------------------------------------------
  describe('notifyAll', () => {
    it('debe emitir un evento a todos los clientes conectados', () => {
      const event = 'citaCancelada';
      const data = { id: 1 };

      service.notifyAll(event, data);

      expect(gatewayMock.getServer).toHaveBeenCalled();
      expect(serverMock.emit).toHaveBeenCalledWith(event, data);
    });

    it('no debe fallar si el server es null', () => {
      gatewayMock.getServer.mockReturnValue(null);

      expect(() => service.notifyAll('evento', {})).not.toThrow();
    });
  });

  // ----------------------------------------------------------------------
  //                          TEST notifyDoctor()
  // ----------------------------------------------------------------------
  describe('notifyDoctor', () => {
    it('debe emitir un evento a una sala específica', () => {
      const userId = 5;
      const event = 'nuevaCita';
      const data = { citaId: 44 };

      service.notifyDoctor(userId, event, data);

      const expectedRoom = `user-${userId}`;

      expect(gatewayMock.getServer).toHaveBeenCalled();
      expect(serverMock.to).toHaveBeenCalledWith(expectedRoom);
      expect(serverMock.emit).toHaveBeenCalledWith(event, data);
    });

    it('no debe fallar si server es null', () => {
      gatewayMock.getServer.mockReturnValue(null);

      expect(() => service.notifyDoctor(10, 'evento', {})).not.toThrow();
    });
  });
});
