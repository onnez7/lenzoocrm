jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { Request, Response } from 'express';
import db from '../../config/db';
import { getFranchiseMembers } from '../../controllers/franchiseController';

const mockQuery = db.query as jest.Mock;

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('getFranchiseMembers — controle de acesso', () => {
  beforeEach(() => mockQuery.mockClear());

  it('FRANCHISE_ADMIN: retorna 403 quando tenta acessar membros de outra franquia', async () => {
    const req = {
      params: { id: '99' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getFranchiseMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('FRANCHISE_ADMIN: retorna membros da própria franquia', async () => {
    const fakeMembers = [{ id: 5, name: 'João', role: 'EMPLOYEE' }];
    mockQuery.mockResolvedValueOnce({ rows: fakeMembers });

    const req = {
      params: { id: '1' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getFranchiseMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeMembers);
  });

  it('EMPLOYEE: retorna 403 quando tenta acessar membros de outra franquia', async () => {
    const req = {
      params: { id: '50' },
      user: { id: 3, role: 'EMPLOYEE', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await getFranchiseMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN: acessa membros de qualquer franquia', async () => {
    const fakeMembers = [{ id: 10, name: 'Admin', role: 'FRANCHISE_ADMIN' }];
    mockQuery.mockResolvedValueOnce({ rows: fakeMembers });

    const req = {
      params: { id: '99' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getFranchiseMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeMembers);
  });
});
