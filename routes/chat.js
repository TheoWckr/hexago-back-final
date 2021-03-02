let async = require('async/waterfall');

let express = require('express');
let router = express.Router();
let Chat = require('../models/chat');





router.post('/create', (req, res, next) => {
    Chat.create(req.body, (err, content) => {
        if (err) res.json({err: err});
        else {
            if (content) {
                res.json({content: content, msg: 'Chat created successfully.'})
            } else {
                res.json({err: 'Unable to create this chat.'})
            }
        }
    })
});

router.get('/', (req, res, next) => {
    Chat.find({}, function (err, content) {
        console.log(content);
        if (err) res.json({
            err: err
        });
        else res.json({content})
    })
  
  });


router.get('/', (req, res, next) => {
    Chat.find({}, function (err, content) {
        console.log(content);
        if (err) res.json({
            err: err
        });
        else res.json({content})
    })

});


module.exports = router;
