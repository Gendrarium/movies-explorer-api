const router = require('express').Router();
const { validateEditProfile } = require('../middlewares/validatons');
const {
  getUserMe, editProfile, logout,
} = require('../controllers/users');

router.post('/logout', logout);
router.get('/users/me', getUserMe);
router.patch('/users/me', validateEditProfile, editProfile);

module.exports = router;
