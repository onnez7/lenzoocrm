import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, authorize } from '../../middleware/authMiddleware';

jest.mock('jsonwebtoken');

const mockVerify = jwt.verify as jest.Mock;

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('authenticateToken', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns 401 when Authorization header is absent', () => {
    const req = makeReq();
    const res = makeRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with Bearer', () => {
    const req = makeReq({ authorization: 'Basic dXNlcjpwYXNz' });
    const res = makeRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when jwt.verify throws (invalid token)', () => {
    mockVerify.mockImplementation(() => { throw new Error('invalid signature'); });
    const req = makeReq({ authorization: 'Bearer bad-token' });
    const res = makeRes();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('populates req.user and calls next when token is valid', () => {
    const payload = { id: 7, role: 'FRANCHISE_ADMIN', franchiseId: 42, iat: 0, exp: 9999999999 };
    mockVerify.mockReturnValue(payload);
    const req = makeReq({ authorization: 'Bearer valid-token' });
    const res = makeRes();

    authenticateToken(req, res, next);

    expect(req.user).toEqual({ id: 7, role: 'FRANCHISE_ADMIN', franchiseId: 42 });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('populates req.user with null franchiseId for SUPER_ADMIN', () => {
    const payload = { id: 1, role: 'SUPER_ADMIN', franchiseId: null, iat: 0, exp: 9999999999 };
    mockVerify.mockReturnValue(payload);
    const req = makeReq({ authorization: 'Bearer super-token' });
    const res = makeRes();

    authenticateToken(req, res, next);

    expect(req.user).toEqual({ id: 1, role: 'SUPER_ADMIN', franchiseId: null });
    expect(next).toHaveBeenCalled();
  });
});

describe('authorize', () => {
  it('returns 403 when req.user is undefined', () => {
    const req = {} as Request;
    const res = makeRes();
    const next = jest.fn();

    authorize('FRANCHISE_ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is not in allowed list', () => {
    const req = { user: { id: 5, role: 'EMPLOYEE', franchiseId: 1 } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn();

    authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when user role is in allowed list', () => {
    const req = { user: { id: 2, role: 'FRANCHISE_ADMIN', franchiseId: 10 } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn();

    authorize('FRANCHISE_ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next when SUPER_ADMIN is among multiple allowed roles', () => {
    const req = { user: { id: 1, role: 'SUPER_ADMIN', franchiseId: null } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn();

    authorize('SUPER_ADMIN', 'FRANCHISE_ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
