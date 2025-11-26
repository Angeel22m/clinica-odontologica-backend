// src/email-verification/email-verification.controller.ts
import { Controller, Post, Body, Req, UseGuards, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { EmailVerificationService } from './correo-verificacion.service';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { ApiParam } from '@nestjs/swagger';


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
  @Post('request-code/:id')
  @HttpCode(202) // Aceptado, el proceso se inició
  async requestCode(@Param('id', ParseIntPipe) id: number) {
    
    await this.verificationService.generateAndStoreCode(id);
    
    return { 
      message: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.',
      expiresIn: '15 minutos'
    };
  }

  /**
   * Endpoint 2: Validar el código introducido por el usuario
   */
  @Post('validate/:id')
  @ApiParam({ name: 'id', description: 'ID del user a verificar', example: 1 })
  async validateCode(@Param('id',ParseIntPipe) id:number,@Body() body: ValidateCodeDto) {

    const { code } = body;
    return this.verificationService.validateCodeAndVerifyUser(id, code);
  }
}