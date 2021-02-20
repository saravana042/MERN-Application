const express = require('express');

const router = express.Router();

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Taj mahal',
        description: 'One of the most famous sky scrapers in the world!',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u2'
    }
]

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid; // { pid: 'p1' }
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    })
    //console.log("GET Request in Places");
    res.json({ place }); // => { place } => { place: place }
});

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid; // { uid: 'u1 }
    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId;
    })
    res.json({ place })
});

module.exports = router;