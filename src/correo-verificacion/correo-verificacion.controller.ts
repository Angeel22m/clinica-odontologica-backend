// src/email-verification/email-verification.controller.ts
import { Controller, Post, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { EmailVerificationService } from './correo-verificacion.service';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

class JwtAuthGuard { canActivate() { return true; } } // Placeholder
class RequestWithUser { user: { id: number }; } // Placeholder para el objeto Request

// DTO para la validación del código
class ValidateCodeDto {
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;
}

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly verificationService: EmailVerificationService) {}

  /**
   * Endpoint 1: Solicitar un nuevo código
   * (Requiere que el usuario esté autenticado para saber a quién enviar el código)
   */
  @Post('request-code')
  @UseGuards(JwtAuthGuard) // Asumimos que el usuario está autenticado
  @HttpCode(202) // Aceptado, el proceso se inició
  async requestCode(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    await this.verificationService.generateAndStoreCode(userId);
    
    return { 
      message: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.',
      expiresIn: '15 minutos'
    };
  }

  /**
   * Endpoint 2: Validar el código introducido por el usuario
   */
  @Post('validate')
  @UseGuards(JwtAuthGuard) // Asumimos que el usuario está autenticado
  async validateCode(@Req() req: RequestWithUser, @Body() body: ValidateCodeDto) {
    const userId = req.user.id;
    const { code } = body;
    
    return this.verificationService.validateCodeAndVerifyUser(userId, code);
  }
}