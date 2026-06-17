const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const requireAuth = require('../middleware/auth');

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SIDES = ['tiger', 'goat'];
const RESULTS = ['win', 'loss'];

/**/
/*
recordAiResult(req, res)

NAME
        recordAiResult - Express handler recording a single-player AI game result

SYNOPSIS
        recordAiResult(req, res)
            req     -> req.user set by requireAuth; req.body contains
                       { difficulty, side, result }
            res     -> 400 on invalid input, 500 on Firestore error, 200 on success

DESCRIPTION
        Validates { difficulty, side, result } and atomically increments
        aiStats.<difficulty>.<side>.<wins|losses> on the requesting user's
        Firestore document.

RETURNS
        Sends a JSON response; no explicit return value.

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function recordAiResult(req, res) {
  const { difficulty, side, result } = req.body || {};
  if (!DIFFICULTIES.includes(difficulty) || !SIDES.includes(side) || !RESULTS.includes(result)) {
    return res.status(400).json({ error: 'Invalid difficulty, side, or result' });
  }
  const field = `aiStats.${difficulty}.${side}.${result === 'win' ? 'wins' : 'losses'}`;
  try {
    await admin.firestore().doc(`users/${req.user.uid}`)
      .update({ [field]: admin.firestore.FieldValue.increment(1) });
    res.status(200).json({ status: 'recorded' });
  } catch (err) {
    console.error('ai-game/result failed:', err);
    res.status(500).json({ error: 'Failed to record result' });
  }
}

router.post('/result', requireAuth, recordAiResult);

module.exports = router;
module.exports.recordAiResult = recordAiResult;
