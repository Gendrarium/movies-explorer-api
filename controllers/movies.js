const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const Movie = require('../models/movie');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .populate('user')
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введите корректные данные!'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Фильм по данному id не найдена.'));
      } else if (!data.owner.equals(req.user._id)) {
        next(new ForbiddenError('Нельзя удалить чужой фильм!'));
      } else {
        Movie.findByIdAndRemove(req.params.movieId)
          .then((movie) => {
            if (!movie) {
              next(new NotFoundError('Фильм по данному id не найдена.'));
            } else {
              res.send(movie);
            }
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('Некорректно введены данные.'));
            } else {
              next(err);
            }
          });
      }
    })
    .catch(next);
};
