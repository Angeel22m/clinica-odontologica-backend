/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import express from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { SignupDto } from './dto/signup.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
async login(@Body() authPayload: AuthPayloadDto) {
  const result = await this.authService.validateUser(authPayload, false);
  return result;
}


  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: express.Request) {    
    return req.user;
  }

  @Post('signup')
  async signup(@Body() signupData: SignupDto) {
    return this.authService.signupUser(signupData);
  }
  
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin(){

  }

@UseGuards(GoogleAuthGuard)
@Get('google/callback')
googleCallback(@Req() req: express.Request, @Res() res: express.Response) {
  const googleUser: SignupDto = req.user as SignupDto;
  this.authService.validateGoogleUser(googleUser).then((result) => {
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(result)}, "http://localhost:5173");
            window.close();
          </script>
        </body>
      </html>
    `);
  });
}



}
