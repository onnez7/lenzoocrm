jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { Request, Response } from 'express';
import db from '../../config/db';
import {
  getOpportunityActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../../controllers/opportunityActivityController';

const mockQuery = db.query as jest.Mock;

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

// ------------------------------------------------------------------
describe('getOpportunityActivities — verificação de franquia', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 403 quando oportunidade pertence a outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // opportunity check retorna vazio
    const req = {
      params: { opportunityId: '10' },
      query: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getOpportunityActivities(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockQuery).toHaveBeenCalledTimes(1); // apenas o check, sem buscar atividades
  });

  it('FRANCHISE_ADMIN: retorna atividades quando oportunidade é da sua franquia', async () => {
    const fakeActivities = [{ id: 1, title: 'Ligar para cliente' }];
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 10 }] }) // opportunity check OK
      .mockResolvedValueOnce({ rows: fakeActivities }); // SELECT atividades

    const req = {
      params: { opportunityId: '10' },
      query: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getOpportunityActivities(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeActivities);
  });

  it('SUPER_ADMIN: bypassa verificação de franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // apenas o SELECT de atividades
    const req = {
      params: { opportunityId: '10' },
      query: {},
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getOpportunityActivities(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1); // sem opportunity check
  });
});

// ------------------------------------------------------------------
describe('getActivityById — controle de acesso', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 403 quando atividade é de outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // activity ownership check vazio
    const req = {
      params: { id: '5' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getActivityById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('FRANCHISE_ADMIN: retorna 200 quando atividade pertence à sua franquia', async () => {
    const fakeActivity = { id: 5, title: 'Reunião' };
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })        // ownership check OK
      .mockResolvedValueOnce({ rows: [fakeActivity] });      // SELECT atividade

    const req = {
      params: { id: '5' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getActivityById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeActivity);
  });
});

// ------------------------------------------------------------------
describe('createActivity — verificação de oportunidade', () => {
  beforeEach(() => mockQuery.mockClear());

  it('retorna 400 quando title está ausente', async () => {
    const req = {
      params: { opportunityId: '10' },
      body: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('FRANCHISE_ADMIN: retorna 403 quando oportunidade é de outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // opportunity check falha
    const req = {
      params: { opportunityId: '10' },
      body: { title: 'Contato inicial' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('FRANCHISE_ADMIN: cria atividade quando oportunidade é da sua franquia', async () => {
    const newActivity = { id: 99, title: 'Contato inicial' };
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })  // opportunity check OK
      .mockResolvedValueOnce({ rows: [newActivity] });  // INSERT

    const req = {
      params: { opportunityId: '10' },
      body: { title: 'Contato inicial' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newActivity);
  });
});

// ------------------------------------------------------------------
describe('updateActivity — controle de acesso', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 403 quando atividade é de outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const req = {
      params: { id: '5' },
      body: { title: 'Novo título' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await updateActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ------------------------------------------------------------------
describe('deleteActivity — controle de acesso', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 403 quando atividade é de outra franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const req = {
      params: { id: '5' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await deleteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('FRANCHISE_ADMIN: deleta quando atividade pertence à sua franquia', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })  // ownership check OK
      .mockResolvedValueOnce({ rows: [{ id: 5 }] });  // DELETE

    const req = {
      params: { id: '5' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await deleteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('SUPER_ADMIN: deleta sem verificação de franquia', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] }); // apenas o DELETE
    const req = {
      params: { id: '5' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await deleteActivity(req, res);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
