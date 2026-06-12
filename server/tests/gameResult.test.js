const mockFindOne = jest.fn();
jest.mock('../models/chatrooms.model', () => ({ findOne: mockFindOne }));

const mockDocUpdate = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn(() => ({ update: mockDocUpdate }));
const mockIncrement = jest.fn((n) => ({ __increment: n }));
jest.mock('../firebaseAdmin', () => {
    const firestore = () => ({ doc: mockDoc });
    firestore.FieldValue = { increment: mockIncrement };
    return { firestore };
});

const { recordGameResult } = require('../services/gameResult');

function makeRoom(overrides) {
    return Object.assign({
        name: 'room01',
        creator_uid: 'uid-creator',
        joiner_uid: 'uid-joiner',
        creator_piece: 'tiger',
        winner: '-',
        reported_winner: '-',
        reported_by: '-',
        save: jest.fn().mockResolvedValue(undefined)
    }, overrides);
}

beforeEach(() => {
    mockFindOne.mockReset();
    mockDoc.mockClear();
    mockDocUpdate.mockClear();
});

test('unknown room is rejected', async () => {
    mockFindOne.mockResolvedValue(null);
    const result = await recordGameResult('nope', 'T', 'uid-creator');
    expect(result.status).toBe('no-room');
});

test('non-participant cannot report', async () => {
    mockFindOne.mockResolvedValue(makeRoom());
    const result = await recordGameResult('room01', 'T', 'uid-stranger');
    expect(result.status).toBe('not-a-player');
});

test('first report is parked, no stats written', async () => {
    const room = makeRoom();
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('awaiting-confirmation');
    expect(room.reported_winner).toBe('T');
    expect(room.reported_by).toBe('uid-creator');
    expect(room.save).toHaveBeenCalled();
    expect(mockDoc).not.toHaveBeenCalled();
});

test('same player reporting twice does not commit', async () => {
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-creator' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('duplicate-report');
    expect(mockDoc).not.toHaveBeenCalled();
});

test('matching second report commits: winner gets a win, loser a loss', async () => {
    // creator played tiger and tiger won => creator is the winner
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-joiner' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('recorded');
    expect(room.winner).toBe('T');
    expect(mockDoc).toHaveBeenCalledWith('users/uid-creator');
    expect(mockDoc).toHaveBeenCalledWith('users/uid-joiner');
    const updates = mockDocUpdate.mock.calls.map(c => c[0]);
    expect(updates).toContainEqual({ wins: { __increment: 1 } });
    expect(updates).toContainEqual({ losses: { __increment: 1 } });
});

test('conflicting reports reset the pending report', async () => {
    const room = makeRoom({ reported_winner: 'T', reported_by: 'uid-joiner' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'G', 'uid-creator');
    expect(result.status).toBe('mismatch');
    expect(room.reported_winner).toBe('-');
    expect(room.reported_by).toBe('-');
    expect(mockDoc).not.toHaveBeenCalled();
});

test('finished room cannot be re-reported', async () => {
    const room = makeRoom({ winner: 'T' });
    mockFindOne.mockResolvedValue(room);
    const result = await recordGameResult('room01', 'T', 'uid-creator');
    expect(result.status).toBe('already-recorded');
});
