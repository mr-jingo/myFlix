const express = require('express'),
      morgan = require('morgan');

const app = express();

let topMovies = [
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
];

app.use(morgan('common'));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/movies/:title', (req, res) => {
  res.send('Get data about a single movie by title');
});

app.get('/users', (req, res) => {
  res.send('Get a list of users');
});

app.get('/users/:name', (req, res) => {
  res.send('Get data about a single user by name');
});

//POST requests
app.post('/users', (req, res) => {
  res.send('Add an user');
});

app.post('/users/:name/movies/:movieId', (req, res) => {
  res.send('Add a movie by ID to the favorite list of an user');
});

//UPDATE request
app.put('/users/:name', (req, res) => {
  res.send('User was updated');
});

//DELETE requests
app.delete('/users/:name', (req, res) => {
  res.send('User was deleted');
});

app.delete('/users/:name/movies/:movieId', (req, res) => {
  res.send('Movie was deleted');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
