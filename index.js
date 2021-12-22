require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const cors = require('cors')
const app = express().use('*', cors());
const axios = require('axios');
const port = 8888;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.get('/',(req,res) => {
    res.send('Hello World!');
});

/**
 * Generates a random string containing numbers and letters
 * @param {number} length the length of the string
 * @return {string} the generated string
 */

const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
}

const stateKey = 'spotify_auth_state';

//request authorization from spotify
app.get('/login', (req,res) => {
    const state = generateRandomString(16);
    //setting a cookie with our state key and the state is the randomly generated string
    res.cookie(stateKey, state);

    const scope = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
      ].join(' ');

    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URL,
        state: state,
        scope: scope,
    })
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

//use auth code to request access token
app.get('/callback', (req,res) => {
    const code = req.query.code || null;

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URL
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
             Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
    }).then(response => {
        if(response.status === 200) {
            const { access_token, refresh_token, expires_in } = response.data;
            const queryParams = querystring.stringify({
                access_token,
                refresh_token,
                expires_in
            })
            //redirect to react app
            res.redirect(`${FRONTEND_URL}/?${queryParams}`);
            //pass along tokens in query params
        } else {
            res.redirect(`/?${querystring.stringify({error:'invalid token value'})}`);
        }
    }).catch(error => {
        res.send(error);
    });
});

//use refresh token to request another access token incase it expires
app.get('/refresh_token', (req,res) => {
    const { refresh_token } = req.query;
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send(error);
    })
});

app.listen(port, () => {
    console.log(`express app listening at localhost:${port}`);
});

