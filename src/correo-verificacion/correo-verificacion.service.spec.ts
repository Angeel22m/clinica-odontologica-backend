import { Test, TestingModule } from '@nestjs/testing';
import { CorreoVerificacionService } from './correo-verificacion.service';

import { UserService } from '../user/user.service'; 
import { MailerService } from '@nestjs-modules/mailer'; 
describe('CorreoVerificacionService', () => {
  let service: CorreoVerificacionService;

  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorreoVerificacionService,
        {
          provide: UserService, 
          useValue: mockUserService, 
        },
        {
          provide: MailerService, 
          useValue: mockMailerService, 
        },
      ],
    }).compile();

    service = module.get<CorreoVerificacionService>(CorreoVerificacionService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
