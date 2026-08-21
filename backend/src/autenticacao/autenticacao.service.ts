import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacaoService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async criarUsuario(dto: CriarUsuarioDto) {
    const email = dto.email.trim().toLowerCase();
    const documento = (dto.documento ?? dto.cpf ?? '').replace(/\D/g, '');

    if (!/^\d{11}$|^\d{14}$/.test(documento)) {
      throw new ConflictException('Informe um CPF ou CNPJ válido');
    }

    const usuarioExistente = await this.usuariosRepository.findOne({
      where: [{ email }, { cpf: documento }],
    });

    if (usuarioExistente) {
      throw new ConflictException(
        usuarioExistente.email === email
          ? 'E-mail já cadastrado'
          : 'CPF ou CNPJ já cadastrado',
      );
    }

    const usuario = this.usuariosRepository.create({
      nome: dto.nome.trim(),
      email,
      cpf: documento,
      senhaHash: await bcrypt.hash(dto.senha, 12),
    });
    const usuarioSalvo = await this.usuariosRepository.save(usuario);

    return this.gerarRespostaAutenticacao(usuarioSalvo);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.senhaHash')
      .where('usuario.email = :email', { email })
      .getOne();

    if (!usuario || !(await bcrypt.compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    return this.gerarRespostaAutenticacao(usuario);
  }

  private async gerarRespostaAutenticacao(usuario: Usuario) {
    const token = await this.jwtService.signAsync(
      { sub: usuario.id, email: usuario.email },
      { secret: this.configService.getOrThrow<string>('JWT_SECRET') },
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }
}
