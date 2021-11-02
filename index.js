const express = require('express'),
      morgan = require('morgan'),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixMongoDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

const cors = require('cors');
app.use(cors());
/*let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));*/

/*let topMovies = [
  {
    id: 1,
    title: 'Conan the Barbarian',
    director: 'John Milius'
  },
  {
    id: 2,
    title: 'Aliens',
    director: 'James Cameron'
  },
  {
    id: 3,
    title: 'Inception',
    director: 'Christopher Nolan'
  },
  {
    id: 4,
    title: 'American Beauty',
    director: 'Sam Mendes'
  },
  {
    id: 5,
    title: 'High Fidelity',
    director: 'Stephen Frears'
  },
  {
    id: 6,
    title: 'Staying Alive',
    director: 'Sylvester Stallone'
  },
  {
    id: 7,
    title: 'Matrix',
    director: 'Die Wachowskis'
  },
  {
    id: 8,
    title: 'The Big Lebowski',
    director: 'Joel Coen'
  },
  {
    id: 9,
    title: 'Indiana Jones and the Temple of Doom',
    director: 'Steven Spielberg'
  },
  {
    id: 10,
    title: 'The Empire Strikes Back',
    director: 'Irvin Kershner'
  }
];*/

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST requests
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], ((req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  //let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
}));

app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//UPDATE request
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//DELETE requests
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.username}, {
    $pull: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
