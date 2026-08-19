import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TransacoesService } from './transacoes.service';

const usuarioId = 'usuario-origem';
const destinatario = {
  id: 'usuario-destino',
  email: 'destino@senna.com',
};

function criarService() {
  const transacoesRepository = {
    find: jest.fn(),
    create: jest.fn((dados: unknown) => dados),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const usuariosRepository = {
    findOne: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };

  return {
    service: new TransacoesService(
      transacoesRepository as never,
      usuariosRepository as never,
      dataSource as never,
    ),
    transacoesRepository,
    usuariosRepository,
    dataSource,
  };
}

function configurarSaldo(
  transacoesRepository: ReturnType<typeof criarService>['transacoesRepository'],
  saldo: string,
) {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ saldo }),
  };
  transacoesRepository.createQueryBuilder.mockReturnValue(queryBuilder);
}

describe('TransacoesService.transferir', () => {
  it('rejeita destinatário inexistente', async () => {
    const { service, usuariosRepository } = criarService();
    usuariosRepository.findOne.mockResolvedValue(null);

    await expect(
      service.transferir(usuarioId, {
        destinatarioEmail: 'ausente@senna.com',
        valor: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejeita transferência para a própria conta', async () => {
    const { service, usuariosRepository } = criarService();
    usuariosRepository.findOne.mockResolvedValue({
      id: usuarioId,
      email: 'origem@senna.com',
    });

    await expect(
      service.transferir(usuarioId, {
        destinatarioEmail: 'origem@senna.com',
        valor: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejeita transferência sem saldo suficiente', async () => {
    const { service, usuariosRepository, transacoesRepository } =
      criarService();
    usuariosRepository.findOne.mockResolvedValue(destinatario);
    configurarSaldo(transacoesRepository, '9.99');

    await expect(
      service.transferir(usuarioId, {
        destinatarioEmail: destinatario.email,
        valor: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('salva débito e crédito na mesma transação', async () => {
    const { service, usuariosRepository, transacoesRepository, dataSource } =
      criarService();
    usuariosRepository.findOne.mockResolvedValue(destinatario);
    configurarSaldo(transacoesRepository, '100.00');

    const entityManager = {
      create: jest.fn((_: unknown, dados: unknown) => dados),
      save: jest.fn().mockResolvedValue(['saida', 'entrada']),
    };
    dataSource.transaction.mockImplementation(
      (callback: (manager: typeof entityManager) => Promise<unknown>) =>
        callback(entityManager),
    );

    await expect(
      service.transferir(usuarioId, {
        destinatarioEmail: destinatario.email,
        valor: 25.5,
        descricao: 'Pagamento',
      }),
    ).resolves.toEqual(['saida', 'entrada']);

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(entityManager.create).toHaveBeenCalledTimes(2);
    expect(entityManager.save).toHaveBeenCalledTimes(1);
    expect(entityManager.save).toHaveBeenCalledWith([
      expect.objectContaining({ usuarioId, tipo: 'saida', valor: '25.50' }),
      expect.objectContaining({
        usuarioId: destinatario.id,
        tipo: 'entrada',
        valor: '25.50',
      }),
    ]);
  });
});
