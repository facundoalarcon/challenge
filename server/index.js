const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// for text list
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    //.query('CREATE TABLE IF NOT EXISTS address (ip INET)')
    .query('CREATE TABLE IF NOT EXISTS address (ip VARCHAR)')
    .catch((err) => console.log(err));
});

// download
const https = require('https');
var options = {
    host: 'www.dan.me.uk',
    path: '/torlist/?exit',
    port: 443,
    method: 'GET'
};

var req = https.request(options, (res) => {
    res.setEncoding('utf8');
    var content = '';
    res.on('data', (chunk) => {
      // chunk contains data read from the stream
      // - save it to content
      content += chunk;
    });

    res.on('end', () => {
      // verifica si no devuelve  Umm... You can only fetch the data every 30 minutes - sorry antes de escribir
      if (!content.includes('Umm')) {
        let writeStream = fs.createWriteStream('iplist.txt');
        writeStream.write(content);
        console.log('IP downloaded!');
      } else {
        console.log(content);
      }      
    });
});

req.end();

// download from get
app.get('/values/download', (req, res) => {
  const ipurl = 'https://www.dan.me.uk/torlist/?exit'
  const ippath = 'iplist2.txt'

  downloadTorIp(ipurl, ippath, () => {
    res.send('Done!')
  });

});

// Express route handlers
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM address');
  res.send(values.rows);
});

// text data
app.get('/values/tor', (req, res) => {
  fs.readFile('iplist.txt', 'utf8', function(err, data) {
    if (err) throw err;
    res.send(data);
  });
});

// missing ip 
app.get('/values/missing', async (req, res) => {
  
  // Ip list from txt
  let listIp = fs.readFileSync('iplist.txt', 'utf8');
  let arrIp = listIp.trim().split("\n");
  
  // Db data
  let jsonDb = await pgClient.query('SELECT * FROM address');
  let arrDb = []
  for(item of jsonDb.rows){
     arrDb.push(item.ip);
   }
  let strDb = arrDb.join('\n');
  
  // result -> con esto muestra un array se podria devolver esto ya
  let arrM = arrIp.filter(n=>!strDb.includes(n));
  //res.send (arrIp.filter(n=>!strDb.includes(n)));
  let strM = arrM.join('\n');
  
  res.send(strM);

});

// regular expression IPv4 and IPv6
const rx = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/

app.post('/values', async (req, res) => {
  const ip = req.body.ip;
  
  // check DB
  const query = await pgClient.query('SELECT ip FROM address WHERE ip = $1', [ip]);
  const cant = query.rowCount;

  if(cant !== 0) {
    return res.status(422).send('Already exist');
  }
  
  //check reg ex
  if (!rx.test(ip)) {
    return res.status(422).send('Bad ip');
  }

  pgClient.query('INSERT INTO address(ip) VALUES($1)', [ip]);
  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Listening');
});
