import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CriarCartaoDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  externalReference!: string;

  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, {
    message: 'expiryMonth deve estar entre 01 e 12',
  })
  expiryMonth!: string;

  @IsString()
  @IsNotEmpty()
  expiryYear!: string;

  @IsString()
  @IsNotEmpty()
  cvv!: string;

  @IsInt()
  @Min(1)
  @Max(21)
  installments!: number;

  @IsNumber()
  @Min(0.01)
  feePercent!: number;
}
