//get env keys
const keys = require('./keys');
//import redis client
const redis = require('redis');

//Create redis client
const redisClient = redis.createClient({
    //to client pass objects for host and port
    host: keys.redisHost,
    port: keys.redisPort,
    //if connection lost retry every 1 second
    retry_strategy: () => 1000
});

//subscription, watch redis a get new value when it shows up
const sub = redisClient.duplicate();

//function to calculate fib
function fib(index) {
    //return 1 if index less than 2 
    if(index < 2) return 1;
    //else get the previous two values and minus
    return fib(index -1) + fib(index - 2);
}

//Watch redis for insert event
//anytime new value shows up
//run callback is called with channel and message
//callback called with channel and message
sub.on('message', (channel, message) => {
    //when we get new value in redis
    //calculate new fib value fib(parseInt(message))
    //and insert into hash called values with key of index supplied from message value
    //and value from fib calculate
    redisClient.hset('values', message, fib(parseInt(message)));
});

//subscribe to redis insert event
sub.subscribe('insert');









