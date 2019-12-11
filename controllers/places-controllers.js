//__________________MIDDLEWARE FUNCTIONS FILE______________________

const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire Building',
        description: 'One of the most famous sky scrapers in the world',
        imageUrl: 'https://cdn.hasselblad.com/50fa7113b58d986f501c5ecf7e2f9c0e83e6b4e8_x1d-ii-sample-01.jpg',
        address: 'Sample Human Readable Address',
        location: {
            lat: 40.6538876,
            lng: -73.9878364
        },
        creator: 'u1' 
    },
    {
        id: 'p2',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world',
        imageUrl: 'https://cdn.hasselblad.com/50fa7113b58d986f501c5ecf7e2f9c0e83e6b4e8_x1d-ii-sample-01.jpg',
        address: 'Sample Human Readable Address',
        location: {
            lat: 40.6538876,
            lng: -73.9878364
        },
        creator: 'u2' 
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    })

    if(!place){
        throw new HttpError('Could not find a place with the provided Id.', 404);
    }

    res.json({place});
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter(p => {
        return p.creator === userId;
    })
    if(!places || places.length === 0){
        const error = new Error('Could not find places for the provided User Id.');
        error.code = 404;
        return next(error);
    }
    res.json({places});
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(
            new HttpError('Invalid inputs passed. Please check your data!', 422)
        );
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    }catch(error){
        return next(error);
    }

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place: createdPlace});
}

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed. Please check your data!', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatePlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;

    res.status(200).json({place: updatePlace});
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if(!DUMMY_PLACES.find(p => p.id === placeId)){
        throw new HttpError('Could not find a place with that Id', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: "Place Deleted" });
}

exports.createPlace       = createPlace;
exports.getPlaceById      = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.updatePlace       = updatePlace;
exports.deletePlace       = deletePlace;