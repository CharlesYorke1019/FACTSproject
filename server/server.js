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

const conversionsArr = [];
var globalData = [];

var index = 0;

// fetchApiData() --> function called whenever we want to target data from the Crypto Compare API //
async function fetchApiData() {
    const response = await axios.get(
        `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ETH,EUR`
    );

    const ETH = response.data.ETH;
    const EUR = response.data.EUR;

    return response.data;
}

const storeInfo = (info1, info2, info3, time, date) => {

    redisClient.set(`ETH`, info1);
    redisClient.set(`EUR`, info2);
    redisClient.set(`CONV`, info3)

    // store new data with Redis using the experation option (since we only need to store the data for 24 hours at a time) //
    // redisClient.setEx(`ETH`, 86400, info1);
    // redisClient.setEx(`EUR`, 86400, info2);
    // redisClient.setEx(`CONV`, 86400, info3);

}

// how to retrieve values with Redis //
const retrieveInfo = () => {
    return redisClient.get(`CONV`);
}

let dateHolder = new Date();

// when the app is first ran, fetchApiData() is called so that we can populate redis with data (could just wait until the setInterval() call below hits, but then redis will not be populated for 60 seconds)
fetchApiData().then((info) => {
    let conversion = info.EUR / info.ETH
    storeInfo(info.ETH, info.EUR, conversion);  

    // index = new Date().getHours().toString() + new Date().getMinutes().toString();
    // index = new Date().getHours().toString() + new Date().getMinutes().toString() - 1600;

    index = new Date().getHours();
    // set index to what's inside console.log() below when all times of day are set up on front end
    // console.log(new Date().getHours() * 60  + new Date().getMinutes());

    globalData[index] = conversion;
    index++;
});

// every minute (60000 in ms | currently at 10000 so we can test quicker and more efficient) we call fetchApi so that we can update the conversion rate every minute
setInterval(() => {
    fetchApiData().then((info) => {
        let conversion = info.EUR / info.ETH
        // let date = dateHolder.getDate();
        // let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
        storeInfo(info.ETH, info.EUR, conversion);
        
        if (index >= 23) {
            globalData = [conversion];
            index = 1;
        } else {
            globalData[index] = conversion;
            index++;
        }
    });
}, 10000)

// listening for users connecting to the server
io.on('connection', (socket) => {
    console.log('connection')
    // console.log(globalData);

    // when a user connects, we grab the current time and call retrieveInfo() so that we can emit the desired info back to the user (could just wait for the setInterval() call below but users wouldn't get data for 60 seconds on connecting)
    let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
    retrieveInfo().then((info) => {
        io.emit('sendingBackData', info, index, globalData);
    })

    // we grab the current time, we then retrieve the info from Redis and emit it back to the users, we call this in setInterval so that every minute the data is checked updated and sent back to the user
    setInterval(() => {

        let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
        retrieveInfo().then((info) => {
            io.emit('sendingBackData', info, index, globalData);
        })


    }, 10000)    

})

server.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`));

