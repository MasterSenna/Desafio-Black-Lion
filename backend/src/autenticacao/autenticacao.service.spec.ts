import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AutenticacaoService } from './autenticacao.service';
import { Usuario } from '../usuarios/usuario.entity';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  const repo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: repo,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token-mock'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('jwt-secret-test'),
          },
        },
      ],
    }).compile();

    service = module.get<AutenticacaoService>(AutenticacaoService);
  });

  it('deve salvar cpf ao criar usuario', async () => {
    const dto = {
      nome: 'Vitoria Felicio',
      email: 'vitoria.nova@gmail.com',
      senha: 'vitoria1234',
      cpf: '12345678909',
    };

    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((usuario) => usuario);
    repo.save.mockImplementation(async (usuario) => ({
      ...usuario,
      id: 'usuario-1',
    }));

    await service.criarUsuario(dto);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Vitoria Felicio',
        email: 'vitoria.nova@gmail.com',
        cpf: '12345678909',
        senhaHash: expect.any(String),
      }),
    );

    const senhaHash = repo.create.mock.calls[0][0].senhaHash;
    expect(await bcrypt.compare('vitoria1234', senhaHash)).toBe(true);
  });

  it('deve aceitar CNPJ no cadastro de pessoa jurídica', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((usuario) => usuario);
    repo.save.mockImplementation(async (usuario) => ({
      ...usuario,
      id: 'usuario-pj-1',
    }));

    await service.criarUsuario({
      nome: 'Empresa Senna',
      email: 'empresa@senna.com',
      senha: 'empresa1234',
      tipoPessoa: 'PJ',
      documento: '12345678000199',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf: '12345678000199',
        nome: 'Empresa Senna',
      }),
    );
  });
});
