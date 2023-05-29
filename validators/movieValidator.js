const curr_year = new Date().getFullYear().toString().slice(-2);

const { body, validationResult } = require('express-validator')
const userValidationRules = () => {
  return [
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}


function validateMovieFields(req, res, next) {
    console.log('validateFields called');
    const errors = [];
    if (!req.body[0].Title || req.body[0].Title.length < 2 || req.body[0].Title.length > 50) {
        errors.push('Title is required, and must be between 2 and 50 characters. ');
    }
    if (!req.body[0].Year || req.body[0].Year < 1900 || req.body[0].Year > parseInt("20" + curr_year)) {
        errors.push('ReleaseYear is required, and must be between 1900 and the current year, inclusive.');
    }
    if (!req.body[0].Rated || req.body[0].Rated.length < 2 || req.body[0].Rated.length > 20) {
        errors.push('Rated is required, and must be between 2 and 20 characters. ');
    }
    if (!req.body[0].Released || req.body[0].Released.length < 10 || req.body[0].Released.length > 20 || !Date.parse(req.body[0].Released)) {
        errors.push('Released is required, must be between 10 and 20 characters, and must be a date in the form "dd mmm YYYY". ');
    }
    if (!req.body[0].Runtime || !isValidRuntime(req.body[0].Runtime)) {
        errors.push('Runtime is required, and must be between 30 and 500 minutes, inclusive.');
    }
    if (!req.body.Genre || req.body[0].Genre.length < 2 || req.body[0].Genre.length > 50 || !isValidGenre(req.body[0].Genre)) {
        errors.push('Genre is required, and must be between 2 and 50 characters. ');
    }
    if (!req.body[0].Director || req.body[0].Director.length < 2 || req.body[0].Director.length > 50) {
        errors.push('Director is required, and must be between 2 and 50 characters. ');
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    next();
}

function isValidRuntime(runtime) {
    const minutes = parseInt(runtime.substring(0, runtime.indexOf(" ")));
    return !isNaN(minutes) && minutes >= 30 && minutes <= 500;
}

async function isValidGenre(genre) {
    try {
        const exists = await Genre.exists({ _id: genre });
        return exists;
    } catch (error) {
        // Handle error if unable to perform genre validation
        console.error('Error validating genre:', error);
        return false;
    }
}

async function isValidDirector(director) {
    try {
        const exists = await Director.exists({ _id: director });
        return exists;
    } catch (error) {
        // Handle error if unable to perform genre validation
        console.error('Error validating director:', error);
        return false;
    }
}

// const { userValidationRules, validate } = require('./validator.js')
// app.post('/user', userValidationRules(), validate, (req, res) => {
//   User.create({
//     username: req.body.username,
//     password: req.body.password,
//   }).then(user => res.json(user))
// })

module.exports = {
  userValidationRules,
  validate,
  validateMovieFields,
}