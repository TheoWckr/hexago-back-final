let async = require('async/waterfall');

let express = require('express');
let router = express.Router();
let Badge = require('../models/badge');

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

//get all badges
router.get('/', (req, res, next) => {
    Badge.find({}, function (err, content) {
        if (err) res.json({
            err: err
        });
        else res.json({content})
    })

});

//post create a badge

router.post('/create', (req, res, next) => {
    Badge.create(req.body, (err, content) => {
        if (err) res.json({err: err});
        else {
            if (content) {
                res.json({content: content, msg: 'Badge created successfully.'})
            } else {
                res.json({err: 'Unable to create this badge.'})
            }
        }
    })
});

//get a badge
router.get('/:id', function (req, res, next) {
    if (!req.params.id) res.json({
        err: 'Please provide an id param.'
    });
    else {
        Badge.findById(
            req.params.id, (err, content) => {
                if (err) res.json({
                    err: err
                });
                else {
                    if (content) {
                        res.json({
                            content
                        })
                    } else {
                        res.json({
                            err: 'No badge found with this id.'
                        })
                    }
                }
            })
    }
});

//delete a badge
router.delete('/:id', (req, res, next) => {
    if (!req.params.id) res.json({
        err: 'Please provide an id param.'
    });
    else if (req.params.id.length !== 24)
        res.json({
            err: 'Please provide a valid id param.'
        });
    else
        Badge.findByIdAndDelete(req.params.id, (err, content) => {
            if (err) res.json({
                err: err
            });
            else
            if (content) {
                res.json({
                    _id: req.params.id,
                    msg: 'Badge deleted successfully.'
                })
            } else {
                res.json({
                    err: 'No Badge found with this id.'
                })
            }
        })
});

module.exports = router;
