require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');

const app = express();
const port = 3000;

//api credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const encodedCreds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

//enable cors to allow frontend to call the backend
app.use(cors());

let accessToken = null;
let tokenExpiresat = 0;

async function getToken() {
    if (accessToken && Date.now() < tokenExpiresat) {
        return accessToken;
    }

    const data = qs.stringify({
        grant_type: 'client_credentials',
        scope: 'product.compact'
    });

    const response = await axios.post('https://api.kroger.com/v1/connect/oauth2/token', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedCreds}`
        }
    });

    accessToken = response.data.access_token;
    tokenExpiresat = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
}

app.get('/products', async (req, res) => {
    try {
        const token = await getToken();
        const { term = 'milk', locationId = '01400441' } = req.query;

        const response = await axios.get('https://api.kroger.com/v1/products', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                'filter.term': term,
                'filter.locationId': locationId
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});