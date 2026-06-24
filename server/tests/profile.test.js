const mockDocSet = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ set: mockDocSet }));
jest.mock('../firebaseAdmin', () => ({
  firestore: () => ({ doc: mockDoc }),
  auth: () => ({ verifyIdToken: jest.fn() })
}));

const { setAvatar } = require('../routes/profile');

function makeRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

beforeEach(() => { mockDoc.mockClear(); mockDocSet.mockClear(); });

test('rejects an avatar not in the allowed set', async () => {
  const req = { user: { uid: 'u1' }, body: { avatar: '💩' } };
  const res = makeRes();
  await setAvatar(req, res);
  expect(res.statusCode).toBe(400);
  expect(mockDoc).not.toHaveBeenCalled();
});

test('rejects a missing avatar', async () => {
  const req = { user: { uid: 'u1' }, body: {} };
  const res = makeRes();
  await setAvatar(req, res);
  expect(res.statusCode).toBe(400);
});

test('saves a valid avatar to the user doc (merge)', async () => {
  const req = { user: { uid: 'u1' }, body: { avatar: '🐯' } };
  const res = makeRes();
  await setAvatar(req, res);
  expect(res.statusCode).toBe(200);
  expect(mockDoc).toHaveBeenCalledWith('users/u1');
  expect(mockDocSet).toHaveBeenCalledWith({ avatar: '🐯' }, { merge: true });
});
