const mockDocUpdate = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ update: mockDocUpdate }));
const mockIncrement = jest.fn((n) => ({ __increment: n }));
jest.mock('../firebaseAdmin', () => {
  const firestore = () => ({ doc: mockDoc });
  firestore.FieldValue = { increment: mockIncrement };
  return { firestore, auth: () => ({ verifyIdToken: jest.fn() }) };
});

const { recordAiResult } = require('../routes/aiGame');

function makeRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

beforeEach(() => { mockDoc.mockClear(); mockDocUpdate.mockClear(); });

test('rejects invalid difficulty', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'insane', side: 'tiger', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
  expect(mockDoc).not.toHaveBeenCalled();
});

test('rejects invalid side', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'dragon', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
});

test('rejects invalid result', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'tiger', result: 'draw' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(400);
});

test('a win increments aiStats.<difficulty>.<side>.wins for the user', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'hard', side: 'tiger', result: 'win' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(res.statusCode).toBe(200);
  expect(mockDoc).toHaveBeenCalledWith('users/u1');
  expect(mockDocUpdate).toHaveBeenCalledWith({ 'aiStats.hard.tiger.wins': { __increment: 1 } });
});

test('a loss increments the losses field', async () => {
  const req = { user: { uid: 'u1' }, body: { difficulty: 'easy', side: 'goat', result: 'loss' } };
  const res = makeRes();
  await recordAiResult(req, res);
  expect(mockDocUpdate).toHaveBeenCalledWith({ 'aiStats.easy.goat.losses': { __increment: 1 } });
});
