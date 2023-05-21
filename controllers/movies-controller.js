const Movie = require('../models/movie');
// genre and director models are imported in the movie model

// GET /db
async function getDBList(req, res) {
    console.log('getDBList called');
    try {
      const result = await Movie.collection.conn.db.admin().listDatabases();
      return result;
    } catch (err) {
        console.error(err);
        throw err;
    } 
  }

// GET /movies
async function getMovies(req, res) {
    console.log('getMovies called');
    try {
        const result = await Movie.find({});
        if (result.length === 0) {
        throw { statusCode: 404, message: 'No movies found' };
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } 
}

// GET /movies/:id  ('gameofthrones_2011')
async function getMovieById(req, res, id) {
    console.log('getMovieById called');
    console.log('searching for id:', id);
    try {
        const result = await Movie.findOne({ _id: id });
        if (!result) {
            res.status(404).send('Movie not found: ' + id);
        }
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// GET /title/:title (ie. 'game of thrones', case insensitive)
async function getMovieByTitle(req, res, title) {
    console.log('getMovieByTitle called');
    console.log('title:', title);
    const client = new MongoClient(uri);
    try {
      const result = await Movie.findOne({ Title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (!result || result.length === 0) {
        res.status(404).send('Movie not found: ' + title);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// GET /partial/:title (ie. 'game', case insensitive)
async function getMoviesByPartialTitle(req, res, title) {
    console.log('getMoviesByPartialTitle called');
    try {
      const result = await Movie.find({ Title: { $regex: title, $options: 'i' } }).sort({ Title: 1 });
      if (!result || result.length === 0) {
        res.status(404).send('No movies found matching: ' + title);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    } 
}

    // GET /director/:name (ie. 'john cameron', case insensitive)
  async function getMoviesByDirector(req, res, name) {
    console.log('getContactsByDirector called');
    console.log('name', name);
    try {
      const result = await Movie.find({ Director: { $regex: name, $options: 'i' } }).sort({ Director: 1 });
      if (!result || result.length === 0) {
        res.status(404).send('No movies found with Director matching: ' + name);
      } else {
        return result;
      }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}

    // POST /create
  async function createMovie(req, res)
    {
        console.log('createMovie called');
        let _id;
        try
        {
            const {
                    _id,
                    Title,
                    Year,
                    Rated,
                    Released,
                    Runtime,
                    Genre,
                    Director,
                    Writer,
                    Actors,
                    Plot,
                    Language,
                    Country,
                    Awards,
                    Poster,
                    Metascore,
                    imdbRating,
                    imdbVotes,
                    imdbID,
                    Type,

                } = req.body;

                // create a unique ID
                _id = `${Title}_${Year}`.replace(/\s/g, '').toLowerCase();

                const newMovie =
                {
                    _id,
                    Title,
                    Year,
                    Rated,
                    Rated,
                    Released,
                    Runtime,
                    Genre,
                    Director,
                    Writer,
                    Actors,
                    Plot,
                    Language,
                    Country,
                    Awards,
                    Poster,
                    Metascore,
                    imdbRating,
                    imdbVotes,
                    imdbID,
                    Type,
                };

            // Save the movie object to the database
            const createdMovie = await newMovie.save();

            return res.status(201).json({
                statusCode: 201,
                message: 'Movie created successfully',
                createdMovieId: createdMovie._id.toString(),
            });

            // if (result.insertedId) {
            //     const createdMovieId = result.insertedId;
            //     return res.status(201).json({
            //       statusCode: 201,
            //       message: 'Movie created successfully',
            //       createdMovieId: createdMovieId.toString(),
            //     });
            //   } else {
            //     return res.status(500).json({
            //       statusCode: 500,
            //       message: 'Movie creation failed 1',
            //       id: _id,
            //     });
            //   }
        } catch (err) {
                console.error(err);
                if (err.code === 11000) {
                    return res.status(400).json({
                    statusCode: 400,
                    message: 'Duplicate key violation. Movie creation failed',
                    id: _id,
                    keyValue: err.keyValue,
                    });
                } else {
                    return res.status(500).json({
                    statusCode: 500,
                    message: 'Movie creation failed',
                    id: _id,
                    });
                }
        } 
    }

// PUT /update/:id
async function updateMovie(req, res, id) {
    // if the firstName or lastName fields are updated, then the _id should be updated.
    // in order to update the _id, I need to delete the existing contact and create a new one,
    // since _id is immutable (Should I actually do this?)

    console.log('updateMovie called');
    try {
      const movieId = id || `${req.body.Title}_${req.body.Year}`.replace(/\s/g, '').toLowerCase();

      // Dynamically build the update object based on the fields present in the request body
      const updateFields = {};
      for (const [key, value] of Object.entries(req.body)) {
        updateFields[key] = value;
      }

    // Find the movie with the specified ID and update it with the update object
    const result = await Movie.findOneAndUpdate({ _id: movieId }, updateFields);

    if (result) {
        res.send({ message: `Movie ${movieId} updated successfully` });
        // Check if the update contained the Title and/or Year fields, and if so, update the _id
        if (updateFields.Title || updateFields.Year) {
          await changeMovieId(movieId);
        }
      } else {
        res.status(404).send({ message: `Movie ${movieId} not found` });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

    //  This function is for the internal use of the updateContact() function
    //  It creates a new _id if the firstName or lastName fields are changed
  async function changeMovieId(_id) {
    console.log('changeMovieId called');
    try {
        // Find the old movie record by the _id parameter
        const oldMovie = await Movie.findOne({ _id });

        // Generate a new _id based on the Title and Year fields
        const newMovieId = `${oldMovie.Title.toLowerCase().replace(/\s/g, '')}_${oldMovie.Year}`;
        // Check if the new _id is the same as the old one or already exists
        if (newMovieId === _id || (await Movie.findOne({ _id: newMovieId }))) {
            return;
        }
        // create a new movie object with the updated _id based on the Title and Year fields
        const newMovie = {
                _id: oldMovie.Title.toLowerCase().replace(' ', '') + '_' + oldMovie.Year,
                Title: oldMovie.Title,
                Year: oldMovie.Year,
                Rated: oldMovie.Rated,
                Released: oldMovie.Released,
                Runtime: oldMovie.Runtime,
                Genre: oldMovie.Genre,
                Director: oldMovie.Director,
                Writer: oldMovie.Writer,
                Actors: oldMovie.Actors,
                Plot: oldMovie.Plot,
                Language: oldMovie.Language,
                Country: oldMovie.Country,
                Awards: oldMovie.Awards,
                Poster: oldMovie.Poster,
                Metascore: oldMovie.Metascore,
                imdbRating: oldMovie.imdbRating,
                imdbVotes: oldMovie.imdbVotes,
                imdbID: oldMovie.imdbID,
                Type: oldMovie.Type,
            };

            // Insert the new movie object into the database
            const createdMovie = await newMovie.save();

            if (createdMovie) {
                // Delete the old movie record
                await Movie.deleteOne({ _id });
                return res.status(201).json({
                    statusCode: 201,
                    message: 'Movie created successfully',
                    data: createdMovie,
                });
            }
    } catch (err) {
            console.error(err);
            if (err.code === 11000) {
                return res.status(400).json({
                    statusCode: 400,
                    message: 'Record creation failed. Duplicate key detected.',
                });
            } else {
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Record creation failed. An internal server error occurred.',
            });
        }
    }
}

// DELETE /delete/:id
async function deleteMovie(req, res, id) {
    console.log('deleteMovie called');
    try {
      const movieId = id;
      const result = await Movie.deleteOne({ _id: movieId });
      if (result.deletedCount > 0) {
        return res.send({ message: `Movie ${movieId} deleted successfully` });
      } else {
        return res.status(404).send({ message: `Movie ${movieId} not found` });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


  module.exports = {
    getDBList,
    getMovies,
    getMovieById,
    getMovieByTitle,
    getMoviesByPartialTitle,
    getMoviesByDirector,
    createMovie,
    updateMovie,
    deleteMovie,
  };

  console.log('movies-controller.js is loaded!');

