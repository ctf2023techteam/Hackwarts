const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the default view engine
app.set('view engine', 'ejs');
// Use body-parser middleware to parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Set up database connection
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
)`);

// Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  let role = 'user';

  // Hash the password and insert the new user into the database
  bcrypt.hash(password, 2, (err, hashedPassword) => {
    if (err) {
      console.log('Error hashing password', err);
      res.status(500).send('Internal Server Error');
    } else {
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role],
        (err) => {
          if (err) {
            console.log('Error creating user', err);
            res.status(500).send('Internal Server Error');
          } else {
            res.status(200).send('User created successfully');
          }
        }
      );
    }
  });
});

// Render aboutus page
app.get('/aboutus', (req, res) => {
  res.render('aboutus');
});

// Log in a user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  // Find the user in the database
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        console.log('Error finding user', err);
        res.status(500).send('Internal Server Error');
      } else if (!row) {
        console.log('User not found');
        res.status(401).send('Invalid username or password');
      } else {
        // Check if the password is correct
        bcrypt.compare(password, row.password, (err, result) => {
          if (err) {
            console.log('Error comparing passwords', err);
            res.status(500).send('Internal Server Error');
          } else if (!result) {
            console.log('Invalid password');
            res.status(401).send('Invalid username or password');
          } else {
            // Create a JWT token and set it as a cookie
            const token = jwt.sign({ 
              id: row.id, 
              username: row.username, 
              role: 'user' 
            }, 'qT3<qSf7);gey,-c<u,%qp9${');
            res.cookie('token', token);
            res.redirect('/welcome');
          }
        });
      }
    }
  );
});


// Middleware to require authentication
function requireAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const payload = jwt.verify(token, 'qT3<qSf7);gey,-c<u,%qp9${');
    if (payload.role !== 'admin') {
      return res.status(403).send('Forbidden');
    }
    req.user = payload;
    next();
  } catch (error) {
    console.log('Error verifying token', error);
    res.status(500).send('Internal Server Error');
  }
}

// Define the /v3r1_S3cr3t_adm1n_pag3 route
app.get('/v3r1_S3cr3t_adm1n_pag3', requireAdmin, (req, res) => {
  // Query the users table to get the username and role for all users
  db.all('SELECT username, role FROM users', (err, rows) => {
    if (err) {
      console.log('Error getting users', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Render the admin page with the list of users and some dummy text
      res.render('admin', { users: rows, text: 'Lorem ipsum dolor sit amet', user: req.user });
    }
  });
});

// Authenticate user with JWT
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token found');
    res.redirect('/login');
  } else {
    jwt.verify(token, 'qT3<qSf7);gey,-c<u,%qp9${', (err, decoded) => {
      if (err) {
        console.log('Invalid token', err);
        res.redirect('/login');
      } else {
        db.get(
          'SELECT username FROM users WHERE id = ?',
          [decoded.id],
          (err, row) => {
            if (err) {
              console.log('Error getting username', err);
              res.status(500).send('Internal Server Error');
            } else {
              req.username = row.username;
              next();
            }
          }
        );
      }
    });
  }
};

// Get the password hash for a user
app.get('/users/:username/password', requireAdmin, (req, res) => {
  const { username } = req.params;

  db.get(
    'SELECT password FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        console.log('Error getting password', err);
        res.status(500).send('Internal Server Error');
      } else if (!row) {
        console.log('User not found');
        res.status(404).send('User not found');
      } else {
        res.render('hash', { username, password: row.password });
      }
    }
  );
});


// Render welcome for authenticated user
app.get('/welcome', authenticateUser, (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, 'qT3<qSf7);gey,-c<u,%qp9${');
  const username = decoded.username;
  res.render('welcome', { username: username });
});

// Log out the user
app.post('/logout', (req, res) => {
  res.render('logout');
});

// Render logout page
app.get('/logout', (req, res) => {
  res.clearCookie('token', { expires: new Date(0) });
  res.render('logout');
});
    
// Render login page
app.get('/login', (req, res) => {
res.render('login');
});

// Render registration page
app.get('/register', (req, res) => {
res.render('register');
});

// Render home page
app.get('/', (req, res) => {
res.render('index');
});

// Start the server
app.listen(port, () => {
console.log(`Server listening on port ${port}`);
});
