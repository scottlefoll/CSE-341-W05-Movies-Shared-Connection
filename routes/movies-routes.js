const routes = require('express').Router();
const {param, query, validationResult} = require('express-validator');
const moviesController = require('../controllers/movies-controller');


routes.get('/', (req, res) => {
    res.send('Welcome to the MongoDB Movies API! Please enter a valid endpoint to continue (all parameters are case-insensitive): (/db (List of databases), /movies (List of all movies), /movies/:id (single movie by id, i.e. - avatar_2009 ), /title/:title (single movie by title, i.e. - avatar [case insensitive] ), /partial/:title (all movies by partial title, i.e. - avat [case insensitive] ), /director/:name (all movies by director name, i.e. - james cameron [case insensitive]), /create/:id (create movie), /update/:id (update movie), /delete/:id (delete movie)');
});


routes.get('/db', async (req, res, next) => {
    console.log('in /db');
    try {
      const collection = await moviesController.getDBList();
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });


routes.get('/movies', async (req, res, next) => {
    console.log('in /movies route');
    try {
      const collection = await moviesController.getMovies();
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });


routes.get('/movies/:id', param('id').notEmpty().matches(/^[A-Za-z0-9]+_[A-Za-z0-9]{4}$/), async (req, res, next) => {
    console.log('in /movies/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      const collection = await moviesController.getMovieById(req, res, req.params.id);
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

routes.get('/title/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
    console.log('in /movies/:title route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      const collection = await moviesController.getMovieByTitle(req, res, req.params.Title);
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });

routes.get('/partial/:Title', param('Title').notEmpty().isAlphanumeric().isLength({ max: 50 }), async (req, res, next) => {
  console.log('in /movies/partial/:title route');
  const result = validationResult(req);
  if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
  }
  try {
    const collection = await moviesController.getMoviesByPartialTitle(req, res, req.params.Title);
    res.send(collection);
  } catch (err) {
    next(err);
  }
});


routes.get('/director/:name', param('name').notEmpty(), async (req, res, next) => {
    console.log('in /movies/director/:name route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      const collection = await moviesController.getMoviesByDirector(req, res, req.params.name);
      res.send(collection);
    } catch (err) {
      next(err);
    }
  });


routes.post('/create', async (req, res, next) => {
    console.log('in /movies/create route');
    try {
      await moviesController.createMovie(req, res);
    } catch (err) {
      next(err);
    }
});

routes.get('/update/:id', param('id').notEmpty().matches(/^[A-Za-z0-9]+_[A-Za-z0-9]{4}$/), async (req, res, next) => {
    console.log('in /movies/update/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      await moviesController.updateMovie(req, res, req.params.id);
    } catch (err) {
      next(err);
    }
  });


  routes.get('/delete/:id', param('id').notEmpty().matches(/^[A-Za-z0-9]+_[A-Za-z0-9]{4}$/), async (req, res, next) => {
    console.log('in /movies/delete/:id route');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    try {
      await moviesController.deleteMovie(req, res, req.params.id);
    } catch (err) {
      next(err);
    }
  });

module.exports = routes;
