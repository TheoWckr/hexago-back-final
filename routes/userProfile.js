let async = require('async/waterfall');
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let express = require('express');
let router = express.Router();
let userProfile = require('../models/userProfile');
const auth = require("../middleware/auth");

router.get('/', (req, res, next) => {
  userProfile.find({}, function (err, content) {
      console.log(content);
      if (err) res.json({
          err: err
      });
      else res.json({content})
  })

});

//post create a UserProfile

router.post('/create', (req, res, next) => {
  userProfile.create(req.body, (err, content) => {
      if (err) res.json({err: err});
      else {
          if (content) {
              res.json({content: content, msg: 'userProfile created successfully.'})
          } else {
              res.json({err: 'Unable to create this userProfile.'})
          }
      }
  })
});

router.patch("/update/:id", async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    if (!req.params.id) {
      res.status(400).send({err: 'Please provide an id param.'})
      res.end()
    }
    else if (req.params.id.length !== 24) {
      res.status(422).send({err: 'Please provide a valid id param.'})
      res.end()
    }
    const user = await userProfile.findById(req.params.id);

    if (req.body.experience) {
      user.experience = req.body.experience
    }

    if (req.body.rank) {
      user.rank = req.body.rank
    }
    if (req.body.friendList) {
      user.friendList = req.body.friendList
    }

    if (req.body.blackList) {
      user.blackList = req.body.blackList
    }
    if (req.body.favoriteGames) {
      user.favoriteGames = req.body.favoriteGames
    }
    console.log(user);

    await user.save();
    res.status(200).json({ content: user});
  } catch (e) {
    res.status(400).send({ message: "Error in Fetching user" });
  }
});

//get a userProfile
router.get('/:id', function (req, res, next) {
  if (!req.params.id) res.json({
      err: 'Please provide an id param.'
  });
  else if (req.params.id.length !== 24)
      res.json({
          err: 'Please provide a valid id param.'
      });
  else {
      userProfile.findById(
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
                          err: 'No userProfile found with this id.'
                      })
                  }
              }
          })
  }
});

//delete a userProfile
router.delete('/:id', (req, res, next) => {
  if (!req.params.id) res.json({
      err: 'Please provide an id param.'
  });
  else if (req.params.id.length !== 24)
      res.json({
          err: 'Please provide a valid id param.'
      });
  else
      userProfile.findByIdAndDelete(req.params.id, (err, content) => {
          if (err) res.json({
              err: err
          });
          else
          if (content) {
              res.json({
                  _id: req.params.id,
                  msg: 'userProfile deleted successfully.'
              })
          } else {
              res.json({
                  err: 'No userProfile found with this id.'
              })
          }
      })
});

module.exports = router;
