const keys = require('./keys');

//EXPRESS APP SET UP
//import libraries
const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');

//create new express app
//responds to any HTTP requests coming or going to react app
const app = express();
//cross origin resource sharing
//allows requests from one domain (react app) to another domain (express api hosted)
app.use(cors());
//parse incoming requests from react app a turn body into json for express api to work with
app.use(bodyParser.json());

//--------------------------
//POSTGRES CLIENT SET UP
//logic for express to comm with postgres server
//pool module from pg library
const { Pool } = require('pg');
//create pgclient out of pool object
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
//listener
pgClient.on('error', () => console.log('Lost PG connection'));

//if you connect to db you must create a table to store values
//this stores all values submitted to fib calculator
pgClient
    //creates a table if not been created 
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch (err => console.log(err));
//--------------------------

//--------------------------
//REDIS CLIENT SET UP
//ensure Express has connection to Redis
//so it can push number into Redis
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

//redis requires a duplicate connection if you have a client listening/publishing info on redis
//listening connection cannot be used for other purposes
const redisPublisher = redisClient.duplicate();
//--------------------------

//EXPRESS ROUTE HANDLERS
//route handler
//test route to make sure app is working correctly
app.get('/', (req,res) => {
    res.send('Hi');
});

//route handler
//used to query running progress
//retrieve all values submitted
app.get('/values/all', async (req,res) => {
    //select all values from values table
    const values = await pgClient.query('SELECT * from values');
    //send only data back to whoever is making request
    res.send(values.rows);
});

//route handler
//look at redis hash and get all values inside it
app.get('/values/current', async (req,res) => {
    //get all values from hash values 
    //redis does not support promises thus no await thus using callbacks
    redisClient.hgetall('values', (err,values) => {
        res.send(values);
    });
});

//route handler
//recieves values from new react app and posts to backend
app.post('/values', async (req,res) => {
    //get submitted index value
    const index = req.body.index;

    //do this as calculation is very slow above index of 40 with this set up
    //so throw error if too high
    if (parseInt(index) > 40) {
        return res.status(442).send('Index too high');
    }

    //put value in data store
    redisClient.hset('values',index, 'Nothing yet!');
    //redis publishes insert event
    //wakes up worker process
    redisPublisher.publish('insert', index);
    //stores index in postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    //send arbitary response
    res.send({working: true});
});


//listen to port 5000
app.listen(5000, err => {
    console.log('listening')
});


