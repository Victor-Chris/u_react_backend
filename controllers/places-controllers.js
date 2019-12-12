//__________________MIDDLEWARE FUNCTIONS FILE______________________
// Commented code is for system w dummy data (w/o the MongoDB)

//________LIBRARIES__________
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

//_______COMPONENTS___________
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

//_________MODELS____________
const Place = require('../models/places');

/* let DUMMY_PLACES = [
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
]; */

/* const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    })

    if(!place){
        throw new HttpError('Could not find a place with the provided Id.', 404);
    }

    res.json({place});
} */

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError(
            "Something went wrong, could not find a place.", 500
        );
        return next(error);
    }

    if(!place){
        const error = new HttpError('Could not find a place with the provided Id.', 404);
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
}

/* const getPlacesByUserId = (req, res, next) => {
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
} */

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    
    try{
        places = await Place.find({ creator: userId });
    }catch(err){
        const error = new HttpError(
            "Fetching places failed, please try again later!", 500
        )

        return next(error);
    }
    
    if(!places || places.length === 0){
        const error = new Error('Could not find places for the provided User Id.');
        error.code = 404;
        return next(error);
    }
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
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

    /* const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    } */

    const createdPlace = new Place({
        title,
        description, 
        address,
        location: coordinates,
        image: 'https://cdn.hasselblad.com/50fa7113b58d986f501c5ecf7e2f9c0e83e6b4e8_x1d-ii-sample-01.jpg',
        creator
    })

    //DUMMY_PLACES.push(createdPlace);
try{
    await createdPlace.save();
}catch(err){
    const error = new HttpError(
        'Creating place failed, please try again',
        500
    );
    return next(error);
}

    res.status(201).json({place: createdPlace});
}

/* const updatePlace = (req, res, next) => {
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
} */

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(
            new HttpError('Invalid inputs passed. Please check your data!', 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try{
        place = await Place.findById(placeId)
    }catch(err){
        const error = new HttpError(
            "Something went wrong, could not update place!", 500
        );
        
        return next(error);
    }

    place.title = title;
    place.description = description;

    try{
        place.save();
    }catch(err){
        const error = new HttpError(
            "Something went wrong, could not update place!", 500
        );
        
        return next(error);
    }

    res.status(200).json({place: place.toObject({ getters: true })});
}

/* const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if(!DUMMY_PLACES.find(p => p.id === placeId)){
        throw new HttpError('Could not find a place with that Id', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: "Place Deleted" });
} */

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    //Find the place
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError(
            "Something went wrong, could not delete place.", 500
        );

        return next(error);
    }

    //Delete the place
    try{
        await place.remove();
    }catch(err){
        const error = new HttpError(
            "Something went wrong, could not delete place.", 500
        );

        return next(error);
    }

    res.status(200).json({ message: "Place Deleted" });
}

exports.createPlace       = createPlace;
exports.getPlaceById      = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.updatePlace       = updatePlace;
exports.deletePlace       = deletePlace;