const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    Title: String,
    Year: String,
    Rated: String,
    Released: String,
    Runtime: String,
    Genre: String,
    Director: String,
    Writer: String,
    Actors: String,
    Plot: String,
    Language: String,
    Country: String,
    Awards: String,
    Poster: String,
    Metascore: String,
    imdbRating: String,
    imdbVotes: String,
    imdbID: String,
    Type: String,
    Response: String,
  });

const genreSchema = new mongoose.Schema({
    type: String,
    description: String,
  });

  const directorSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    birthplace: String,
    dateOfDeath: String,
  });


  const Movie = mongoose.model('Movie', movieSchema);
  const Genre = mongoose.model('Genre', genreSchema);
  const Director = mongoose.model('Director', directorSchema);

  module.exports = { Movie, Genre, Director };
