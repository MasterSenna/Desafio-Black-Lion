import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['PF', 'PJ'])
  tipoPessoa?: 'PF' | 'PJ';

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)',
  })
  documento?: string;

  // Mantido para compatibilidade com clientes antigos da API.
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/)
  cpf?: string;

  @IsString()
  @MinLength(8)
  senha: string;
}
