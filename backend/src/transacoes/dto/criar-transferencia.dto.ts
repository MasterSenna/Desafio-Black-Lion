import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarTransferenciaDto {
  @IsEmail()
  destinatarioEmail: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  descricao?: string;
}
