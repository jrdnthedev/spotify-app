require('dotenv').config();
const express = require('express');
const app = express();
const port = 8888;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

// console.log(process.env.CLIENT_ID);

app.get('/',(req,res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`express app listening at localhost:${port}`);
});

