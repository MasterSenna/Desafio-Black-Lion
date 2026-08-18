import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutenticacaoService } from './autenticacao.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('autenticacao')
@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('cadastro')
  criarUsuario(@Body() dto: CriarUsuarioDto) {
    return this.autenticacaoService.criarUsuario(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.autenticacaoService.login(dto);
  }
}
