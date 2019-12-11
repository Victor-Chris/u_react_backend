const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = '';

async function getCoordsForAddress(address){
    return {
        lat: 40.6538876,
        lng: -73.9878364
    }

    /*const response = await axios.get(`google geocode API`);

    const data = response.data;

    if(!data || data.status === 'ZERO_RESULTS'){
        const error = new HttpError('Could not find your location for the specified address', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;*/
}

module.exports = getCoordsForAddress;

