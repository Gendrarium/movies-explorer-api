const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictingRequestError = require('../errors/conflicting-request-error');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  const testUser = new User({
    email,
    password,
    name,
  });
  testUser.validate((error) => {
    if (error) {
      next(new BadRequestError('Введите корректные данные!'));
    } else {
      bcrypt.hash(password, 10)
        .then((hash) => {
          User.create({
            email, password: hash, name,
          })
            .then((user) => res.status(201).send({ data: user.toJSON() }))
            .catch((err) => {
              if (err.code === 11000) {
                next(new ConflictingRequestError('Пользователь с таким email уже есть в базе!'));
              } else if (err.name === 'ValidationError') {
                next(new BadRequestError('Введите корректные данные!'));
              } else {
                next(err);
              }
            });
        });
    }
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.cookie('token', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      }).send({ user: user.toJSON() });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'Error') {
        next(new UnauthorizedError(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.logout = (req, res, next) => {
  if (req.cookies.token) {
    res.clearCookie('token').send({ message: 'Выход успешно выполнен.' });
  } else {
    next(new BadRequestError('Некорректный запрос'));
  }
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь по данному id не найден.'));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь не найден!'));
      } else {
        next(err);
      }
    });
};

module.exports.editProfile = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name },
    {
      new: true,
      runValidators: true,
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введите корректные данные!'));
      } else if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь не найден!'));
      } else if (err.code === 11000) {
        next(new ConflictingRequestError('Пользователь с таким email уже есть в базе!'));
      } else {
        next(err);
      }
    });
};
