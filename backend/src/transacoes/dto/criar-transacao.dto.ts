import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarTransacaoDto {
  @IsIn(['entrada', 'saida'])
  tipo: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  descricao?: string;
}
