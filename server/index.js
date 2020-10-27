const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require ('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// eg data
const fs = require('fs');

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('connect', () => {
  pgClient
  //
    .query('CREATE TABLE IF NOT EXISTS address (ip INET)')
    .catch((err) => console.log(err));
});

// Redis Client Setup
//const redis = require('redis');
//const redisClient = redis.createClient({
//  host: keys.redisHost,
//  port: keys.redisPort,
//  retry_strategy: () => 1000,
//});
//const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM address');

  res.send(values.rows);
});

//app.get('/values/current', async (req, res) => {
//  redisClient.hgetall('values', (err, values) => {
//    res.send(values);
//  });
//});

// lista ip de tor, los resultados estan separados por espacio (mostrar bien luego en el frontend)
// solo se puede usar cada media hora
app.get('/values/tor', async (req, res) => {
    await axios.get('https://www.dan.me.uk/torlist/?exit')
      .then(response => res.send(response.data))
      .catch(error => console.log(error));
});

// example data
app.get('/values/test', (req, res) => {
  fs.readFile('iplist.txt', 'utf8', function(err, data) {
    if (err) throw err;
    res.send(data);
  });
});

app.post('/values', async (req, res) => {
  const ip = req.body.ip;

   if (parseInt(ip) > 40) {
     return res.status(422).send('Bad ip');
   }

  //redisClient.hset('values', ip, 'Nothing yet!');
  //redisPublisher.publish('insert', ip);

  pgClient.query('INSERT INTO address(ip) VALUES($1)', [ip]);
  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Listening');
});
