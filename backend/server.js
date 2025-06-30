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

//gets kroger api access token
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

//product search from api endpoint
app.get('/products', async (req, res) => {
    const searchTerm = req.query.term;
    const locationId = "01400441";

    if (!searchTerm) {
        return res.status(400).json({ error: 'Missing search term'});
    }

    try {
        const token = await getToken();

        const response = await axios.get('https://api.kroger.com/v1/products', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                'filter.term': searchTerm,
                'filter.locationId': locationId
            }
        });

        const products = response.data.data.map(product => {
            // Get product images
            const imageObj = product.images?.find(img => img.perspective === 'front');
            const largeImage = imageObj?.sizes?.find(s => s.size ==='large');
            const imageUrl = largeImage ? largeImage.url : null;

            // Get product price (prioritize promotion prices)
            const productItem = product.items && product.items.length > 0 ? product.items[0] : null;
            let price = null;

            if (productItem?.price) {
                price = productItem.price.regular ?? null;
            }

            // Returns the product info to front end
            return {
                description: product.description,
                image: imageUrl,
                price: price,
            };
        });

        //res.json(response.data);
        console.log(products);
        res.json({ data: products });

    } catch (error) {
        console.error('Error fetching from Kroger API:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});