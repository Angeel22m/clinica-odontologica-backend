/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import express from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: express.Request) {    
    return req.user;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: express.Request) {
    console.log('método status - AuthController');
    return req.user;
  }

  @Post('signup')
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signupUser(signupData);
  }
}
