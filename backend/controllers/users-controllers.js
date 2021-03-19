const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Saravana',
        email: 'test1@test1.com',
        password: 'testers1'
    },
    {
        id: 'u2',
        name: 'karthick',
        email: 'test2@test2.com',
        password: 'testers2'
    }
];

const getUsers = async (req, res, next) => {
    //res.json({ users: DUMMY_USERS });
    let users

    try {
        users = await User.find({}, '-password');
        console.log("users:", users);
    }
    catch (err) {
        const error = new HttpError(
            'Cannot get Users', 500
        );
        return next(error);
    }

    res.status(200).json({
        users: users.map(user =>
            user.toObject({ getters: true })
        )
    });

};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const { name, email, password } = req.body;

    // const hasUser = DUMMY_USERS.find(u => u.email === email);
    // if (hasUser) {
    //     throw new HttpError('Could not create user, email already exists.', 422);
    // }

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.', 500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exist already, please login instead.', 422
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://image.freepik.com/free-vector/cute-penguin-flying-with-balloons-cartoon-vector-illustration-animal-love-concept-isolated-vector-flat-cartoon-style_138676-2016.jpg',
        password,
        places: []
    });
    console.log("createdUser:", createdUser);
    //DUMMY_USERS.push(createdUser);

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing Up failed, Please try again.', 500
        );
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    // const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    // if (!identifiedUser || identifiedUser.password !== password) {
    //     throw new HttpError('Could not identify user, credentials seem to be wrong.', 401);
    // }

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Signing up login, please try again later.', 500
        );
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.', 401
        );
        return next(error);
    }

    res.json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login