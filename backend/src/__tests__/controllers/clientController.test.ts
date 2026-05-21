jest.mock('../../config/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import { Request, Response } from 'express';
import db from '../../config/db';
import { getAllClients, getClientById, createClient } from '../../controllers/clientController';

const mockQuery = db.query as jest.Mock;

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

// ------------------------------------------------------------------
describe('getAllClients', () => {
  beforeEach(() => mockQuery.mockClear());

  it('returns 200 with paginated list for SUPER_ADMIN', async () => {
    const fakeClients = [{ id: 1, name: 'João Silva', franchise_id: 10 }];
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })  // COUNT total
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })  // COUNT active
      .mockResolvedValueOnce({ rows: fakeClients });       // SELECT

    const req = {
      query: {},
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        clients: fakeClients,
        pagination: expect.objectContaining({ page: 1, total: 1 }),
      })
    );
  });

  it('includes franchise_id in query params for FRANCHISE_ADMIN', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({ rows: [{ total: '2' }] })
      .mockResolvedValueOnce({ rows: [] });

    const req = {
      query: {},
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 42 },
    } as unknown as Request;
    const res = makeRes();

    await getAllClients(req, res);

    // Terceira chamada ao db.query é o SELECT principal; params devem conter 42
    const thirdCallParams = mockQuery.mock.calls[2][1] as unknown[];
    expect(thirdCallParams).toContain(42);
  });

  it('does not include franchise_id in params for SUPER_ADMIN', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    const req = {
      query: {},
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getAllClients(req, res);

    const thirdCallParams = mockQuery.mock.calls[2][1] as unknown[];
    expect(thirdCallParams).not.toContain(null);
  });

  it('returns 500 when database throws', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));

    const req = {
      query: {},
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getAllClients(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ------------------------------------------------------------------
describe('getClientById', () => {
  beforeEach(() => mockQuery.mockClear());

  it('returns 400 for non-numeric ID', async () => {
    const req = {
      params: { id: 'abc' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getClientById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns 403 when FRANCHISE_ADMIN has no franchiseId', async () => {
    const req = {
      params: { id: '1' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getClientById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 404 when client is not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req = {
      params: { id: '999' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getClientById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with full client data when found', async () => {
    const fakeClient = { id: 5, name: 'Maria', franchise_id: 10 };
    mockQuery
      .mockResolvedValueOnce({ rows: [fakeClient] })         // SELECT client
      .mockResolvedValueOnce({ rows: [] })                   // prescriptions
      .mockResolvedValueOnce({ rows: [] })                   // appointments
      .mockResolvedValueOnce({ rows: [{ total: '150.00' }] }) // totalPurchases
      .mockResolvedValueOnce({ rows: [] });                   // lastVisit

    const req = {
      params: { id: '5' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await getClientById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        name: 'Maria',
        totalPurchases: 150,
        prescriptions: [],
        appointments: [],
        lastVisit: null,
      })
    );
  });
});

// ------------------------------------------------------------------
describe('createClient', () => {
  beforeEach(() => mockQuery.mockClear());

  it('returns 400 when name is missing', async () => {
    const req = {
      body: { email: 'test@test.com' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns 403 when FRANCHISE_ADMIN tries to create for a different franchise', async () => {
    const req = {
      body: { name: 'Novo Cliente', targetFranchiseId: 99 },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClient(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns 400 when SUPER_ADMIN omits targetFranchiseId', async () => {
    const req = {
      body: { name: 'Novo Cliente' },
      user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null },
    } as unknown as Request;
    const res = makeRes();

    await createClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 with new client when FRANCHISE_ADMIN creates for own franchise', async () => {
    const newClient = { id: 10, name: 'Ana Souza', franchise_id: 1 };
    mockQuery.mockResolvedValueOnce({ rows: [newClient] });

    const req = {
      body: { name: 'Ana Souza' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClient(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newClient);
  });

  it('returns 500 when database throws during insert', async () => {
    mockQuery.mockRejectedValueOnce(new Error('duplicate key'));

    const req = {
      body: { name: 'Cliente Erro' },
      user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 1 },
    } as unknown as Request;
    const res = makeRes();

    await createClient(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
