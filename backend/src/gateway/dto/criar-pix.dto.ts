import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarPixDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  payerDocument?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  externalReference: string;
}
