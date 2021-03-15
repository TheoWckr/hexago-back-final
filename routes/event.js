let async = require('async/waterfall');
var unirest = require('unirest');
let express = require('express');
let router = express.Router();
let Event = require('../models/event');
let GameDetails = require('../models/gameDetails');
let Users = require ('../models/users');
let moment = require('moment');
moment().format();
const auth = require("../middleware/auth");
const dotEnv = require('dotenv');

dotEnv.config();

// let axios = require('axios')
// axios.defaults.baseURL = `${process.env.AUTH0_AUDIENCE}`

function logHandleError(err) {
    if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(err.response.data)
    } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(err.request)
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error(err.message)
    }
}

//get all events
router.get('/', (req, res, next) => {
    Event.find({}, function (err, content) {
        if (err) res.json({
            err: err
        });
        else res.json({content})
    })

});



//post create an event http://localhost:3100/event/create?token=xxxxxxx
/**
 * @api {post} /event/create Create an event
 * @apiName POST event
 * @apiGroup event
 * @apiDescription event
 *
 * @apiHeader {String} token user's authentication token
 *
 * @apiParam {Date} date Date of an event (iso8601)
 * @apiParam {Number} duration duration of the event in minutes
 * @apiParam {Number} minPlayers minimum number of players to start an event
 * @apiParam {Number} maxPlayers Maximum number of players for an event
 * @apiParam {Array} listGames list of games (gameDetails Object ID)
 * @apiParam {String} locationId location of the event informations
 * @apiParam {String} phone phone number
 * @apiParam {String} details details or description of the event
 *
 * @apiParamExample {json} Request-Example:
 *{
		"duration": 90,
        "date": "2015-10-01T07:22Z",
        "minPlayers": 2,
        "maxPlayers": 4,
        "phone": "+330000000",
        "details": "bobibobou",
        "locationId": "Montpellier",
        "listGames": ["5e95c3eae39f5227dc0533be"]
}
 *
 * @apiSuccessExample {json} Success-Response:
 *{
    "content": {
        "listPlayers": [
            "5e78ab08122bd31750df8c90"
        ],
        "listGames": [
            "5e95c3eae39f5227dc0533be"
        ],
        "_id": "5f55f408c263b75484e416a8",
        "duration": 90,
        "date": "2015-10-01T07:22:00.000Z",
        "minPlayers": 2,
        "maxPlayers": 4,
        "phone": "+330000000",
        "details": "bobibobou",
        "locationId": "Montpellier",
        "owner": "5e78ab08122bd31750df8c90",
        "__v": 0
    },
    "msg": "Event created successfully."
}
 */

router.post('/create', auth, async (req, res, next) => {
    const errorCheck = [];
    let eventToCreate = req.body;
    eventToCreate.owner = "";
    let eventToCreateGameDetailsId = [];
    // TODO in the future, check agenda conflict
    // check if games within listGames exist
    if (req.body.listGames.length !== 0) {
        const listGamesPromise = await req.body.listGames.map(async (game, res,next ) =>
            GameDetails.findOne( {_id: game}, async function (err, result){
                if (!result){
                    errorCheck.push(game);
                }
                else {eventToCreateGameDetailsId.push(result._id)}
            } )

        );
        const resultGameDetails = await Promise.all(listGamesPromise);
    if (errorCheck.length === 0) {
        // put game id list with event to create
        eventToCreate.listGames = eventToCreateGameDetailsId;
        // TODO changer le localhost:3100 par url en production
        eventToCreate.owner = req.user.id
        eventToCreate.listPlayers = [];
        eventToCreate.listPlayers.push(req.user.id)
        // create event in bdd
        Event.create(eventToCreate, (err, content) => {
            if (err) res.json({err: err});
            else {
                if (content) {
                    res.json({content: content, msg: 'Event created successfully.'})
                } else {
                    res.json({err: 'Unable to create this event.'})
                }
            }
        })
    } else {
        res.json({error: 'the following games ' + errorCheck + ' do no exist.'});
    }
    } else {
        res.json({error: 'listGames is required.'})
    }
});



//--------------------------------------------------
//get events and return display list required field /event/quicksearch?date=xxxx&locationId=xxxx&listGames=xxxxx&limit=20&offset=xxxx&showEventFull=xxxx
/**
 * @api {get} /event/searchlist search list of event
 * @apiName GET event searchlist
 * @apiGroup event
 * @apiDescription search a list of events
 *
 * @apiHeader {String} token user's authentication token
 *
 * @apiParam {Date} date start date to search for events, return all event within startdate until 7 days after
 * @apiParam {String} locationId the place of the event
 * @apiParam {ObjectId} listGames search a game within the array of games within the event
 * @apiParam {Boolean} showEventFull return contains event which are full of player if set to true
 * @apiParam {Number} limit Required for pagination, set the number of entries per page
 * @apiParam {Number} offset Required for pagination, select the page desired (first one is 0)
 *
 * @apiSuccessExample {json} Success-Response:
 *{
    "content": {
        "listPlayers": [
            "5e78ab08122bd31750df8c90"
        ],
        "listGames": [
            {
                "_id": "5e95c3eae39f5227dc0533be",
                "name": "7 Wonders Duelle 75"
            }
        ],
        "_id": "5f523e68de91022c1028886c",
        "duration": 90,
        "date": "2015-10-01T07:22:00.000Z",
        "minPlayers": 2,
        "maxPlayers": 4,
        "phone": "+330000000",
        "details": "bobibobou",
        "locationId": "Montpellier",
        "owner": {
            "_id": "5e78ab08122bd31750df8c90",
            "username": "Pip"
        },
        "__v": 0,
        "currentPlayers": 1
    }
}
 */

router.get('/searchlist', async (req, res, next) => {
    let data= {};
    let query= {};
    let offset= 0;
    let limit = 0;
    let whatToSort= {};

    //search by event date and up to 7 days later
    if (req.query.date){
        let laterDate= new Date(moment(req.query.date).add(7,'days').format());
        let date = new Date( req.query.date);
        data['date'] = {
            $gte: new Date(date),
            $lt: new Date(laterDate)
        }
    }
    //search by localisation
    if (req.query.locationId){
        let toRegexp= req.query.locationId;
        data['locationId'] = new RegExp(".*"+toRegexp+".*",'i');
    }
    //search by game within list
    if (req.query.listGames){
        data['listGames']= { '$all': req.query.listGames.split(",")}
    }
    // return full event or not
    if (req.query.showEventFull){
        if (req.query.showEventFull===false){
            data['maxPlayers']= { '$ne': this.listPlayers.length};
        }
    }
    query= Event.find(data).populate('owner', 'username').populate('listGames', 'name img').select('listGames  date owner maxPlayers locationId listPlayers');


    //pagination handling

    if (req.query.limit) {
        limit = parseInt(req.query.limit);
        query = query.limit(limit)
    }
    if (req.query.offset) {
        offset = parseInt(req.query.offset);
        query = query.skip(offset*limit)
    }

        query.exec(function (err, content){
            let data = [];
            for (let current=0; current < content.length; current++)
            {
                data.push({
                    listPlayers: content[current].listPlayers.length,
                    listGames: content[current].listGames,
                    maxPlayers: content[current].maxPlayers,
                    locationId: content[current].locationId,
                    owner: content[current].owner,
                    date: content[current].date,
                    _id: content[current]._id
                });
            }
            res.send({content:data});
        });
});

//-----------------------------------------------------------------------------------------
//get an event by it id
/**
 * @api {get} /event/searchid/_id get an event by it id
 * @apiName GET event by id
 * @apiGroup event
 * @apiDescription Get an event by it id
 *
 * @apiHeader {String} token user's authentication token
 *
 * @apiHeader {ObjectID} _id Unique ID of an event
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *{
    "content": {
        "listPlayers": [
            "5e78ab08122bd31750df8c90"
        ],
        "listGames": [
            {
                "_id": "5e95c3eae39f5227dc0533be",
                "name": "7 Wonders Duelle 75"
            }
        ],
        "_id": "5f523e68de91022c1028886c",
        "duration": 90,
        "date": "2015-10-01T07:22:00.000Z",
        "minPlayers": 2,
        "maxPlayers": 4,
        "phone": "+330000000",
        "details": "bobibobou",
        "locationId": "Montpellier",
        "owner": {
            "_id": "5e78ab08122bd31750df8c90",
            "username": "Pip"
        },
        "__v": 0,
        "currentPlayers": 1
    }
}
 */
router.get('/searchid/:id', function (req, res, next) {
    // find a game by it id
    if (req.params.id.length !== 24) {
        res.json({
            err: 'Please provide a valid id param.'
        })
    } else {
        Event.findById(
            req.params.id).populate('owner', 'username').populate('listGames', 'name img').exec((err, content) => {
            if (err) res.json({
                err: err
            });
            else {
                if (content) {
                    content.currentPlayers=content.listPlayers.length;
                    res.json({
                        content
                    })
                } else {
                    res.json({
                        err: 'No event found with this id.'
                    })
                }
            }
        })
    }
});


// subscribe to an event route
router.put('/subscribe/:id', auth, async (req, res) => {
    try {
        if (!req.params.id) res.json({
            err: 'Please provide an id param.'
        });
        else if (req.params.id.length !== 24) {
            res.json({
                err: 'Please provide a valid id param.'
            });
        }
        else {
            const event = await Event.findById(req.params.id);
            if (event.listPlayers.indexOf(req.user.id) == -1 && event.owner != req.user.id)  {
                event.listPlayers.push(req.user.id);
                await event.save()
            }

            res.json({content: event});
        }
    } catch (e) {
        res.send({ message: "Error in subscribe" });
    }
});

// unsubscribe from an event route
router.put('/unsubscribe/:id', auth, async (req, res) => {
    try {
        if (!req.params.id) res.json({
            err: 'Please provide an id param.'
        });
        else if (req.params.id.length !== 24) {
            res.json({
                err: 'Please provide a valid id param.'
            });
        }
        else {
            const event = await Event.findById(req.params.id);
            if (event.listPlayers.indexOf(event.owner) !== -1) {
                res.json({error: "You can't unsubscribe of your own event"});
            } else {
                if (event.listPlayers.indexOf(req.user.id) != -1)  {
                    event.listPlayers.splice(event.listPlayers.indexOf(req.user.id), 1);
                    await event.save()
                }
                if (event.owner == req.user.id && req.body.playerId) {
                    event.listPlayers.splice(event.listPlayers.indexOf(req.params.playerId), 1);
                    await event.save()
                }

                res.json({content: event});
            }
        }
    } catch (e) {
        res.send({ message: "Error in subscribe" });
    }
});



//------------------------------------------------------------
//delete an event
/**
 * @api {delete} /event/_id delete an event by it id
 * @apiName DELETE event by id
 * @apiGroup event
 * @apiDescription Delete an event by it id
 *
 * @apiHeader {String} token user's authentication token
 *
 * @apiHeader {ObjectID} _id Unique ID of an event
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *{
    "_id": "5f55f408c263b75484e416a8",
    "msg": "Event deleted successfully."
}
 */
router.delete('/:id', auth, (req, res, next) => {
    if (!req.params.id) res.json({
        err: 'Please provide an id param.'
    });
    else if (req.params.id.length !== 24)
        res.json({
            err: 'Please provide a valid id param.'
        });
    else
        Event.findByIdAndDelete(req.params.id, (err, content) => {
            if (err) res.json({
                err: err
            });
            else
            if (content) {
                res.json({
                    _id: req.params.id,
                    msg: 'Event deleted successfully.'
                })
            } else {
                res.json({
                    err: 'No event found with this id.'
                })
            }
        })
});

//--------------------------------------------------------------------------------------------------
// modify an event (details, duration, phone)
/**
 * @api {put} /event/_id Modify an event
 * @apiName PUT event
 * @apiGroup event
 * @apiDescription Modify an event
 *
 * @apiHeader {ObjectID} _id Unique ID of an event, make reference to id via the request param, NOT PART OF THE REQUEST BODY
 * @apiHeader {String} token user's authentication token
 *
 * @apiParam {Number} duration duration of the event in minutes
 * @apiParam {String} phone phone number
 * @apiParam {String} details details or description of the event
 *
 * @apiParamExample {json} Request-Example:
 *{
    "duration": 120,
    "phone": "+33354648797",
    "details": "bababababababababababa"
}
 *
 * @apiSuccessExample {json} Success-Response:
 *{
    "event": {
        "n": 1,
        "nModified": 1,
        "ok": 1
    },
    "msg": "Event updated successfully."
}
 */
router.put('/:id', auth, async (req, res, next) =>{
    const errorCheck = [];
    let eventToModify={};
    eventToModify.duration = req.body.duration;
    eventToModify.phone = req.body.phone;
    eventToModify.details = req.body.details;

    if (!req.params.id) res.json({
        err: 'Please provide an id param.'
    });
    else if (req.params.id.length !== 24)
        res.json({
            err: 'Please provide a valid id param, 24 digits.'
        });
    // check if event already exists
    else { const EventDoesNotExists = await Event.findById(req.params.id, function (error, eventExists) {
        // error handling
        if (!eventExists) {
            errorCheck.push(req.params.id)
        }
    });

    }
    if (errorCheck.length!==0){
        res.json({error : 'Event Does not exists by this id : ' + req.params._id+ '. Please create it first!'});
    } else {
        Event.updateOne({_id: req.params.id}, eventToModify, (err, content) => {
            if (err) res.json({err: err});
            else {
                res.json({event: content, msg: 'Event updated successfully.'})
            }
        })
    }
});


module.exports = router;
