const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // { pid: 'p1' }

    // const place = DUMMY_PLACES.find(p => {
    //     return p.id === placeId;
    // });
    //console.log("GET Request in Places");

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

// Alternative syntax

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid; // { uid: 'u1 }

    // const places = DUMMY_PLACES.filter(p => {
    //     return p.creator === userId;
    // });

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again later', 500
        )
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(
            new HttpError('Could not find a place for the provided user id.', 404)
        );
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description, address } = req.body;
    // const title = req.body.title;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://image.freepik.com/free-vector/cute-penguin-flying-with-balloons-cartoon-vector-illustration-animal-love-concept-isolated-vector-flat-cartoon-style_138676-2016.jpg',
        creator: req.userData.userId
    });

    // DUMMY_PLACES.push(createdPlace);  //unshift(createdPlace)

    let user;

    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again', 500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
        //console.log("created place", createdPlace)
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, Please try again.', 500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        )
    }

    const placeId = req.params.pid;
    const { title, description } = req.body;

    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.', 500
        );
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to edit this place', 401
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    }
    catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.', 500
        );
        return next(error);
    }

    //DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({ place: place.toObject({ getters: true }) });

    //console.log("updatedPlace", updatedPlace);
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    // if (!DUMMY_PLACES.find(p => p.id !== placeId)) {
    //     throw new HttpError('Could not find a place for that id', 404);
    // }

    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place', 500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
    }

    if (place.creator.id !== req.userData.userId) {
        const erro = new HttpError(
            'You are not allowed to delete this place.', 401
        );
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.', 500
        );
        return next(error);
    }

    res.status(200).json({ message: 'Deleted place' });

};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;