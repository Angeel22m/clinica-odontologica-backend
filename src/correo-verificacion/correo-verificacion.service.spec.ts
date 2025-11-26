import { Test, TestingModule } from '@nestjs/testing';
import { CorreoVerificacionService } from './correo-verificacion.service';

describe('CorreoVerificacionService', () => {
  let service: CorreoVerificacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorreoVerificacionService],
    }).compile();

    service = module.get<CorreoVerificacionService>(CorreoVerificacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
