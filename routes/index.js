const router = require('express').Router();
const { validateCreateUser, validateLoginUser } = require('../middlewares/validatons');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');
const users = require('./users');
const movies = require('./movies');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLoginUser, login);

router.use(auth);
router.use(users);
router.use(movies);
router.use((req, res, next) => {
  next(new NotFoundError('Неверный адрес запроса!'));
});

module.exports = router;
