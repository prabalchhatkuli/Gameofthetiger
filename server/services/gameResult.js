const chatrooms = require('../models/chatrooms.model');
const admin = require('../firebaseAdmin');

/**/
/*
recordGameResult()

NAME
        recordGameResult - commit a game result once both players agree

SYNOPSIS
        recordGameResult(roomID, winner, reporterUid)
            roomID       -> room name in the chatrooms collection
            winner       -> 'T' or 'G'
            reporterUid  -> verified Firebase uid of the reporting socket

DESCRIPTION
        First report from a participant is parked on the room document.
        When the *other* participant reports the same winner, the result is
        committed: the room's winner field is set (locking the room) and
        both players' Firestore stats are updated atomically via the Admin
        SDK. Conflicting reports clear the pending report. A room with a
        recorded winner never accepts another report.

RETURNS
        { status } where status is one of: no-room, not-a-player,
        already-recorded, awaiting-confirmation, duplicate-report,
        mismatch, recorded

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function recordGameResult(roomID, winner, reporterUid) {
    const room = await chatrooms.findOne({ name: roomID });
    if (!room) return { status: 'no-room' };
    if (room.winner !== '-') return { status: 'already-recorded' };

    const isParticipant = reporterUid === room.creator_uid || reporterUid === room.joiner_uid;
    if (!isParticipant) return { status: 'not-a-player' };

    if (room.reported_by === '-') {
        room.reported_winner = winner;
        room.reported_by = reporterUid;
        await room.save();
        return { status: 'awaiting-confirmation' };
    }

    if (room.reported_by === reporterUid) return { status: 'duplicate-report' };

    if (room.reported_winner !== winner) {
        room.reported_winner = '-';
        room.reported_by = '-';
        await room.save();
        return { status: 'mismatch' };
    }

    // both participants agree: lock the room, then credit the stats
    room.winner = winner;
    await room.save();

    const creatorWon = winner === (room.creator_piece === 'tiger' ? 'T' : 'G');
    const winnerUid = creatorWon ? room.creator_uid : room.joiner_uid;
    const loserUid = creatorWon ? room.joiner_uid : room.creator_uid;

    const db = admin.firestore();
    const { increment } = admin.firestore.FieldValue;
    await Promise.all([
        db.doc(`users/${winnerUid}`).update({ wins: increment(1) }),
        db.doc(`users/${loserUid}`).update({ losses: increment(1) })
    ]);

    return { status: 'recorded', winnerUid, loserUid };
}

module.exports = { recordGameResult };
