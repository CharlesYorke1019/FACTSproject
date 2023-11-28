const express = require("express");
const http = require("http");
const socketIO = require('socket.io');
const cors = require('cors')
const axios = require("axios");

const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379
const REDIS_SERVER = "redis://localhost:6379";
var redisClient = redis.createClient(REDIS_SERVER);
redisClient.connect()

const app = express();
app.use(cors);

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = socketIO(server);

// understand that I could do something other than declare the varaible holding the data like this, but when going through it I wanted all users to have the same data and this worked so I stuck with it
// global variables that will be the same for all users
let globalData = [];
let index = 0;

// not set to 1440, because this is being compared to an array (which is 0 indexed)
const minutesInADay = 1439;

// fetchApiData() --> function called whenever we want to target data from the Crypto Compare API, and then return the data //
async function fetchApiData() {
    const response = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ETH,EUR`
    );

    return response.data;
}

// storeInfo() --> function called whenever we want to store data in Redis
const storeInfo = (info, time) => {
    redisClient.set(`ER`, info)

    // Setting the data through redis, will technically only exist for 24 hours after creating
    // understand that I can set an expiration for a value being set in Redis, but with how I have it right now, I wont have to do that because the same times on a later day will essentially override the values set for those times on earlier days
    // For example: Tuesdays conversion rate at 10:00 A.M. will override Mondays conversion rate at 10:00 A.M. making it the new conversion rate for that time
    redisClient.set(`ER_AS_OF_${time}`, info);
}

// how to retrieve values with Redis //
const retrieveInfo = () => {
    return redisClient.get(`ER`);
}

// when the app is first ran, fetchApiData() is called so that we can populate redis with data (could just wait until the setInterval() call below hits, but then redis will not be populated for 60 seconds)
fetchApiData().then((info) => {
    // when the promise is sent back, I create a variable to hold the exchange rate
    let exchangeRate = info.EUR / info.ETH
    // create a variable to get the current time of this action
    let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
    // call storeInfo() which stores the exchangeRate with Redis
    storeInfo(exchangeRate, currentTime);  
    // set the index to the number of the minute within the day that this action occured 
    index = new Date().getHours() * 60  + new Date().getMinutes();
    // set the exchangeRate at the index of index in globalData
    globalData[index] = exchangeRate;
    // increment the index 
    index++;
});

// every minute (60000 in ms) we call fetchApi so that we can update the exchange rate every minute
setInterval(() => {
    fetchApiData().then((info) => {
        // when the promise is sent back, I create a variable to hold the exchange rate
        let exchangeRate = info.EUR / info.ETH
        // create a variable to get the current time of this action
        let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
        // call storeInfo() which stores the exchangeRate with Redis
        storeInfo(exchangeRate, currentTime);
        // check to see if index >= minutesInDay
        if (index >= minutesInADay) {
            // if the conditioal passes: 
            // reset global data to array containing the exchangeRate that was just generated
            globalData = [exchangeRate];
            // set index = 1, because it means that a new day has begun
            index = 1;
        } else {
            // if the conditonal does not pass: 
            // set the exchangeRate at the index of index in globalData
            globalData[index] = exchangeRate;
            // increment the index 
            index++;
        }
    });
}, 60000)

// listening for users connecting to the server
io.on('connection', (socket) => {

    // when a user connects, retrieveInfo() is called so that we can emit the desired info back to the user (could just wait for the setInterval() call below but users wouldn't get data for 60 seconds on connecting)
    retrieveInfo().then((info) => {
        io.emit('sendingBackData', info, globalData);
    })

    // every minute we then retrieve the info from Redis and emit it back to the users, we call this in setInterval so that every minute the data is checked updated and sent back to the user
    setInterval(() => {
        retrieveInfo().then((info) => {
            // once promise is resolved, we emit the globalData variable (which contains all the conversion rates on a given day for each minute of that day) to the users on the front end
            io.emit('sendingBackData', info, globalData);
        })
    }, 60000)    

})

server.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`));

