const router = require('express').Router();
const { validateCreateMovie, validateMovieById } = require('../middlewares/validatons');
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getMovies);
router.post('/movies', validateCreateMovie, createMovie);
router.delete('/movies/:movieId', validateMovieById, deleteMovie);

module.exports = router;
