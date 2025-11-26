import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateFacturaDto {

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  citaId: number;

  // Si deseas permitir enviar un descuento manual
  @IsOptional()
  @IsPositive()
  descuentos?: number;

  // Si deseas permitir marcar si es exonerado/exento
  @IsOptional()
  @IsPositive()
  importeExonerado?: number;

  @IsOptional()
  @IsPositive()
  importeExento?: number;

  // Si quieres permitir CAI manual (en clínicas no suele ser permitido, pero por si acaso)
  @IsOptional()
  @IsString()
  cai?: string;

  // Si deseas permitir un número de factura personalizado (no recomendado)
  @IsOptional()
  @IsString()
  numeroFactura?: string;

}
