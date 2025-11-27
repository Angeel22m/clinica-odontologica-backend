import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  nuevaPassword?: string; // si el admin quiere establecer una propia
}
