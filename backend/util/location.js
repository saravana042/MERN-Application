const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = process.env.GOOGLE_API_KEY;

async function getCoordsForAddress(address) {
    // return {
    //     lat: 40.7,
    //     lng: -73.98
    // };
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError(
            'Could not find location for the specified address.',
            422
        );
        throw error;
    }

    // Refer the Google geo api url for implementation. 
    // Below codes are refer from them

    const coordinates = data.results[0].geometry.location;

    return coordinates;

}

module.exports = getCoordsForAddress;