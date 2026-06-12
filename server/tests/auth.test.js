// jest.mock factories may only reference names prefixed with "mock"
const mockVerifyIdToken = jest.fn();
jest.mock('../firebaseAdmin', () => ({
    auth: () => ({ verifyIdToken: mockVerifyIdToken })
}));

const requireAuth = require('../middleware/auth');

function makeRes() {
    const res = { statusCode: null, body: null };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; return res; };
    return res;
}

beforeEach(() => mockVerifyIdToken.mockReset());

test('rejects request with no Authorization header', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
});

test('rejects request with invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('bad token'));
    const req = { headers: { authorization: 'Bearer garbage' } };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
});

test('attaches decoded token as req.user and calls next on valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: 'abc123', email: 'p@x.com' });
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = makeRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('goodtoken');
    expect(req.user).toEqual({ uid: 'abc123', email: 'p@x.com' });
    expect(next).toHaveBeenCalled();
});
