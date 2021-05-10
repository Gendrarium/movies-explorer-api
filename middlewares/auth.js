const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');
const { NODE_ENV, JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    next(new UnauthorizedError('Необходима авторизация'));
  } else {
    let payload;

    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    } catch (err) {
      next(new UnauthorizedError('Необходима авторизация'));
    }

    req.user = payload;

    next();
  }
};
