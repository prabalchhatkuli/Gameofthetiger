const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const requireAuth = require('../middleware/auth');

const AVATARS = ['🐯','🐐','🦁','🐅','🦊','🐺','🐮','🐱','🐶','🦉','🐲','🐧','😎','🤠','🧔','👴','👵','🧑‍🦱'];

/**/
/*
setAvatar(req, res)

NAME
        setAvatar - Express handler for saving a user's chosen avatar

SYNOPSIS
        setAvatar(req, res)
            req     -> req.user set by requireAuth; req.body contains { avatar }
            res     -> 400 on invalid/missing avatar, 500 on Firestore error, 200 on success

DESCRIPTION
        Validates that the requested avatar is one of the allowed emojis and
        saves it to the requesting user's Firestore doc (merge). req.user is
        set by requireAuth.

RETURNS
        Sends a JSON response; no explicit return value.

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function setAvatar(req, res) {
  const { avatar } = req.body || {};
  if (!AVATARS.includes(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar' });
  }
  try {
    await admin.firestore().doc(`users/${req.user.uid}`).set({ avatar }, { merge: true });
    res.status(200).json({ status: 'ok', avatar });
  } catch (err) {
    console.error('profile/avatar failed:', err);
    res.status(500).json({ error: 'Failed to save avatar' });
  }
}

router.post('/avatar', requireAuth, setAvatar);

module.exports = router;
module.exports.setAvatar = setAvatar;
module.exports.AVATARS = AVATARS;
