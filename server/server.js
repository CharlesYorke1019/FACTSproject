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

const storeInfo = (info1, info2, info3, time) => {
    redisClient.set(`CONV`, info3)
    redisClient.set(`CONV_AS_OF_${time}`, info3);
}

// how to retrieve values with Redis //
const retrieveInfo = () => {
    return redisClient.get(`CONV`);
}

// when the app is first ran, fetchApiData() is called so that we can populate redis with data (could just wait until the setInterval() call below hits, but then redis will not be populated for 60 seconds)
fetchApiData().then((info) => {
    let conversion = info.EUR / info.ETH
    let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
    storeInfo(info.ETH, info.EUR, conversion, currentTime);  

    index = new Date().getHours() * 60  + new Date().getMinutes();
    globalData[index] = conversion;
    index++;
});

// every minute (60000 in ms | currently at 10000 so we can test quicker and more efficient) we call fetchApi so that we can update the conversion rate every minute
setInterval(() => {
    fetchApiData().then((info) => {
        let conversion = info.EUR / info.ETH
        let currentTime = new Date().getHours().toString() + ":" + new Date().getMinutes().toString();
        storeInfo(info.ETH, info.EUR, conversion, currentTime);
        if (index >= 1439) {
            globalData = [conversion];
            index = 1;
        } else {
            globalData[index] = conversion;
            index++;
        }
    });
}, 60000)

// listening for users connecting to the server
io.on('connection', (socket) => {
    console.log('connection')

    // when a user connects, we grab the current time and call retrieveInfo() so that we can emit the desired info back to the user (could just wait for the setInterval() call below but users wouldn't get data for 60 seconds on connecting)
    retrieveInfo().then((info) => {
        io.emit('sendingBackData', info, index, globalData);
    })

    // we grab the current time, we then retrieve the info from Redis and emit it back to the users, we call this in setInterval so that every minute the data is checked updated and sent back to the user
    setInterval(() => {
        retrieveInfo().then((info) => {
            io.emit('sendingBackData', info, index, globalData);
        })
    }, 60000)    

})

server.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`));

