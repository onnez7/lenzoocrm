jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { Request, Response } from 'express';
import db from '../../config/db';
import {
  getAllClientPayments,
  getClientPaymentById,
  createClientPayment,
  updateClientPaymentStatus,
} from '../../controllers/clientPaymentController';

const mockQuery = db.query as jest.Mock;

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

// ------------------------------------------------------------------
describe('getAllClientPayments — isolamento por franchise_id', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: inclui franchise_id nos params da query', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const req = {
      query: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 42 },
    } as unknown as Request;

    await getAllClientPayments(req, makeRes());

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(42);
  });

  it('EMPLOYEE: inclui franchise_id nos params da query', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const req = {
      query: {},
      user: { id: 3, role: 'EMPLOYEE', franchiseId: 7 },
    } as unknown as Request;

    await getAllClientPayments(req, makeRes());

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(7);
  });

  it('SUPER_ADMIN: não filtra por franchise_id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const req = {
      query: {},
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;

    await getAllClientPayments(req, makeRes());

    const [, params] = mockQuery.mock.calls[0];
    expect(params).not.toContain(null);
    expect(params).toHaveLength(2); // só limit e offset
  });
});

// ------------------------------------------------------------------
describe('getClientPaymentById — controle de acesso', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 404 quando pagamento não pertence à sua franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // query filtrando franchise retorna vazio
    const req = {
      params: { id: '5' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 10 },
    } as unknown as Request;
    const res = makeRes();

    await getClientPaymentById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('SUPER_ADMIN: não aplica filtro de franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5, amount: 200 }] });
    const req = {
      params: { id: '5' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getClientPaymentById(req, res);

    const [sql] = mockQuery.mock.calls[0];
    expect(sql).not.toMatch(/AND c\.franchise_id/); // sem filtro de franquia no WHERE
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ------------------------------------------------------------------
describe('createClientPayment — verificação de propriedade do cliente', () => {
  beforeEach(() => mockQuery.mockClear());

  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const req = {
      body: { client_id: 1 },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClientPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('FRANCHISE_ADMIN: retorna 403 quando cliente pertence a outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ franchise_id: 99 }] }); // client check
    const req = {
      body: { client_id: 10, amount: 100, method: 'pix' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClientPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('FRANCHISE_ADMIN: cria pagamento quando cliente é da mesma franquia', async () => {
    const newPayment = { id: 20, client_id: 10, amount: 100 };
    mockQuery
      .mockResolvedValueOnce({ rows: [{ franchise_id: 1 }] }) // client check OK
      .mockResolvedValueOnce({ rows: [newPayment] });          // INSERT

    const req = {
      body: { client_id: 10, amount: 100, method: 'pix' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClientPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newPayment);
  });

  it('SUPER_ADMIN: não verifica franchise do cliente', async () => {
    const newPayment = { id: 21, client_id: 10, amount: 500 };
    mockQuery.mockResolvedValueOnce({ rows: [newPayment] }); // apenas o INSERT
    const req = {
      body: { client_id: 10, amount: 500, method: 'credit_card' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await createClientPayment(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1); // apenas INSERT, sem client check
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ------------------------------------------------------------------
describe('updateClientPaymentStatus — verificação de propriedade', () => {
  beforeEach(() => mockQuery.mockClear());

  it('retorna 400 quando status está ausente', async () => {
    const req = {
      params: { id: '5' },
      body: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await updateClientPaymentStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('FRANCHISE_ADMIN: retorna 403 quando pagamento é de outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ franchise_id: 99 }] }); // ownership check
    const req = {
      params: { id: '5' },
      body: { status: 'paid' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await updateClientPaymentStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('FRANCHISE_ADMIN: atualiza quando pagamento pertence à sua franquia', async () => {
    const updated = { id: 5, status: 'paid' };
    mockQuery
      .mockResolvedValueOnce({ rows: [{ franchise_id: 1 }] }) // ownership check OK
      .mockResolvedValueOnce({ rows: [updated] });             // UPDATE

    const req = {
      params: { id: '5' },
      body: { status: 'paid' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await updateClientPaymentStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});
