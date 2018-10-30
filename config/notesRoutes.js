const express = require('express');
const bcrypt = require('bcryptjs');

const knex = require('knex');

const knexConfig = require('../knexfile.js');

const db = knex(knexConfig.development);

const router = express.Router();

const { authenticate, generateToken } = require('./middleware.js');

// ROUTES/ENDPOINTS

// =================NOTES ENDPOINTS===================

// Add POST Rout Handler to Resgister/Create a user
router.post('/register', (req, res) => {
  const credentials = req.body;

  const hash = bcrypt.hashSync(credentials.password, 15);
  credentials.password = hash;

  db('users')
    .insert(credentials)
    .then(ids => {
      const id = ids[0];
      // query the database to get the user
      const token = generateToken({ username: credentials.username });
      res.status(201).json({ newUserId: id, token });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// Add POST ROUTE HANDLER so user must have valid login to access all of the notes
router.post('/login', (req, res) => {
  const creds = req.body;

  db('users')
    .where({ usersEmail: creds.usersEmail })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user); 
        res.status(200).json({ welcome: user.usersEmail, token });
      } else {
        res.status(401).json({ message: 'login information not found' });
      }
    })
    .catch(err => {
      res.status(500).json({ err });
    });
});

// Add GET ROUTE HANDLER to get the list of notes
router.get('/', authenticate, (req, res) => {
  db('notes')
    .then(notes => {
      res.status(200).json(notes);
    })
    .catch(err => res.status(500).json(err));
});

// Add GET ROUTE HANDLER to get a note by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await db('notes')
      .where({ id })
      .first();

    if (note) {
      res.status(200).json(note);
    } else {
      res.status(404).send({ error: "Note id does not exist. Please provide a valid note id." });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Add POST ROUTE HANDLER to create a note
router.post('/notes', (req, res) => {
  if (!req.body.title || !req.body.textBody){
    return res.status(400).send({ error: "Please provide a valid title and text body for this note." });
  }
  const note = req.body;

  db.insert(note)
    .into('notes')
    .then(ids => {
      res.status(201).json(ids[0]);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

//Add DELETE ROUTE HANDLER to delete a note
router.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;

  db('notes')
    .where ({ id })
    .del()
    .then(count => {
      if (!count || count < 1) {
        res.status(404).json({ message: 'No records found to delete.'});
      } else {
        res.status(200).json(count);
      }
    })
    .catch(err => res.status(500).json(err));
  });

  //Add PUT ROUTE HANDLER to update a note
router.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  db('notes')
    .where ({ id })
    .update(changes)
    .then(count => {
      if (!count || count < 1) {
        res.status(404).json({ message: "No records found to update."});
      } else {
        res.status(200).json(count);
      }
    })
    .catch(err => res.status(500).json(err));
  });

module.exports = router;