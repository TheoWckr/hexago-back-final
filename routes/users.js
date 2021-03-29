let async = require('async/waterfall');
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let express = require('express');
let router = express.Router();
let User = require('../models/users');
let UserProfile = require('../models/userProfile');
const auth = require("../middleware/auth");
const parseImageUpload = require('../middleware/cloudinary');
const uploadImage = require('../cloudinary');
const cloudinary = require('cloudinary');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SERCRET,
});

// let axios = require('axios')
// axios.defaults.baseURL = `${process.env.AUTH0_AUDIENCE}`

function handleError(err) {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {err: err.response.data}
  } else if (err.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return {err: err.request}
  } else {
    // Something happened in setting up the request that triggered an Error
    return {err: err.message}
  }
}

async function sendVerificationEmail(token, email, id) {
  let transporter = nodemailer.createTransport({ 
    service: 'gmail',
    auth: { 
     user: process.env.SMTP_EMAIL, 
     pass: process.env.SMTP_PWD
    }
   }); 

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Hexago" <' + process.env.SMTP_EMAIL + '>', // sender address
    to: email, // list of receivers
    subject: "Email de vérfication", // Subject line
    text: "Bonjour,\n\nMerci de vous être inscrit sur la plateforme Hexago !\n\nPour finaliser votre inscription veuillez valider votre email en cliquant sur le lien suivant:\n\nhttp://localhost:3000/email/" + id + "/verify/" + token + "\n\nBons jeux :)\n\nL'équipe Hexago", // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}


//get all user
router.get('/', auth, (req, res, next) => {
  User.find({}, function (err, content) {
    if (err) res.json({
      err: err
    });
    else res.json({content})
  })
});

//post create a user
/**
 * @api {post} /users/signup Sign Up User
 * @apiName Create User
 * @apiGroup User
 *
 * @apiParam {boolean} isActive User account is active or not
 * @apiParam {String} _id User unique ID
 * @apiParam {String} username User nickname for the service
 * @apiParam {String} firstName User first name
 * @apiParam {String} lastName User last name
 * @apiParam {String} password User's password
 * @apiParam {String} email User email
 * @apiParam {date} dateCreation User account creation date
 * @apiParam {date} dateLastConnection User last connection to account date
 * @apiParam {date} dateOfBirth User date of birth
 * @apiParam {String} userProfileId Id which links to user profile table entry
 * @apiParam {String} roleId Id which determines what roles user has
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
    }
 */
router.post(
  "/signup", parseImageUpload(),
  [
      check("username", "Please Enter a Valid Username").not().isEmpty(),
      check("firstname", "Please Enter a Valid Firstname").not().isEmpty(),
      check("lastname", "Please Enter a Valid Lastname").not().isEmpty(),
      check("email", "Please enter a valid email").isEmail(),
      check("password", "Please enter a valid password").isLength({ min: 6 })
  ],
  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors)
          return res.status(400).json({
              errors: errors.array()
          });
      }
      const {
          username,
          firstname,
          lastname,
          email,
          password,
          userProfile
      } = req.body;
      try {
          let user = await User.findOne({
              email
          });
          if (user) {
              return res.status(400).json({
                  msg: "User Already Exists"
              });
          }
          user = await User.findOne({
            username
          });
          if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
          }
          const newUserProfile = new UserProfile(userProfile);
          const userProfileId = newUserProfile._id;
          user = new User({
            username,
            firstname,
            lastname,
            email,
            password,
            userProfile: userProfileId,
            img: {
              url: "",
              id: ""
            },
            verification: {
              isVerified: false,
              token: uuidv4()
            }
          });

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          user.dateLastConnection = Date.now();
          if (req.file) {
            await uploadImage(req.file)
              .then((result) => {
                user.img.url = result.url
                user.img.id = result.public_id
              })
              .catch((error) => { /* If there is an error uploading the image */
                  console.log(error.message)
              });
          }
          await newUserProfile.save()
          await user.save();
          const payload = {
              user: {
                  id: user.id
              }
          };

          jwt.sign(
              payload,
              "randomString", {
                  expiresIn: 10000
              },
              (err, token) => {
                  if (err) throw err;
                  sendVerificationEmail(user.verification.token, user.email, user._id)
                  res.status(200).json({
                      token
                  });
              }
          );
      } catch (err) {
          console.log(err.message);
          res.status(500).send("Error in Saving " + err.message);
      }
  }
);

/**
 * @api {post} /users/login Sign In User
 * @apiName Login User
 * @apiGroup User
 *
 *
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User's password
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
    }
 */
router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (!user)
        return res.status(404).json({
          message: "User Not Exist"
      });
      if (user.isActive == false) {
        return res.status(400).json({
          message: "User is not Active"
        })
      }


      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      user.dateLastConnection = new Date(Date.now())
      await user.save()

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if (err) throw err;

          res.status(200).json({
            token
          });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);


/**
 * @api {post} /users/update Update User
 * @apiName Update User
 * @apiGroup User
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
 *     }
 *
 * @apiParam {boolean} isActive User account is active or not
 * @apiParam {String} _id User unique ID
 * @apiParam {String} username User nickname for the service
 * @apiParam {String} firstName User first name
 * @apiParam {String} lastName User last name
 * @apiParam {String} password User's password
 * @apiParam {String} email User email
 * @apiParam {date} dateCreation User account creation date
 * @apiParam {date} dateLastConnection User last connection to account date
 * @apiParam {date} dateOfBirth User date of birth
 * @apiParam {String} userProfileId Id which links to user profile table entry
 * @apiParam {String} roleId Id which determines what roles user has
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
    }
 */
router.patch("/update", parseImageUpload(),
  [
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("firstname", "Please Enter a Valid Firstname").not().isEmpty(),
    check("lastname", "Please Enter a Valid Lastname").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 6 })
  ], auth, async (req, res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors)
          return res.status(400).json({
              errors: errors.array()
          });
    }
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);

    let {
      email,
      username
    } = req.body
    let emailUser = await User.find({
     email
    });
    if (emailUser.length > 1) {
        return res.status(400).json({
            msg: "Critical error This email already exists (twice or more)"
        });
    } else if (emailUser.length == 1) {
      if (!emailUser[0]._id.equals(user._id)) {
        return res.status(400).json({
            msg: "This email already exists"
        });
      }
    }
    let usernameUser = await User.find({
      username
    });
    if (usernameUser.length > 1) {
      return res.status(400).json({
        msg: "Critical error This username already exists (twice or more)"
      });
    } else if (usernameUser.length == 1) {
      if (!usernameUser[0]._id.equals(user._id)) {
        return res.status(400).json({
            msg: "This username already exists"
        });
      }
    }
    if (req.body.username) {
      user.username = req.body.username
    }

    if (req.body.firstname) {
      user.firstname = req.body.firstname
    }

    if (req.body.lastname) {
      user.lastname = req.body.lastname
    }

    if (req.body.email) {
      user.email = req.body.email
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.file) {
      await cloudinary.v2.uploader.destroy(user.img.id, { invalidate: true, resource_type: "raw" }, function(result, error) { if (error) { console.log(error)} else {console.log(result)} });
      await uploadImage(req.file)
          .then((result) => {
            user.img.url = result.url
            user.img.id = result.public_id
          })
          .catch((error) => { /* If there is an error uploading the image */
              console.log(error.message)
          });
    }
    await user.save();

    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(
        payload,
        "randomString", {
            expiresIn: 10000
        },
        (err, token) => {
            if (err) throw err;
            res.status(200).json({
                token
            });
        }
    );
  } catch (e) {
    res.status(400).json({
      errors: "Error in updating user: " + e
    })
  }
});

/**
 * @api {post} /users/delete/:id Delete User
 * @apiName Delete User
 * @apiGroup User
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "_id": "5ede13241d139a036b79f5a8",
      "msg": "User deleted successfully."
    }
 */
//delete a user
router.delete('/:id', async (req, res, next) => {
    if (!req.params.id) res.json({
      err: 'Please provide an id param.'
    });
    else if (req.params.id.length !== 24)
      res.json({
        err: 'Please provide a valid id param.'
      });
    else {
      const user = await User.findById(req.params.id);
      if (user != null && user.img.id != "") {
        await cloudinary.v2.uploader.destroy(user.img.id, { invalidate: true, resource_type: "raw" }, function(result, error) { if (error) { console.log(error)} else {console.log(result)} });
      }
      await User.findByIdAndDelete(req.params.id, (err, content) => {
          if (err) res.json({
            err: err
          });
          else
          if (content) {
            res.json({
              _id: req.params.id,
              msg: 'User deleted successfully.'
            })
          } else {
            res.json({
              err: 'No user found with this id.'
            })
          }
      })
    }
});

/**
 * @api {get} /users/:id/verify Send Verify User email
 * @apiName Send Verify User email
 * @apiGroup User
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "msg": "Verify email sended."
    }
 */
router.get('/:id/verify', async (req, res, next) => {
  if (!req.params.id) res.json({
    err: 'Please provide an id param.'
  });
  else if (req.params.id.length !== 24)
    res.json({
      err: 'Please provide a valid id param.'
    });
  else {
    const user = await User.findById(req.params.id);
    sendVerificationEmail(user.verification.token, user.email, user._id)
    res.json({
      msg: 'Verify email sended.'
    })
  }
});

/**
 * @api {post} /users/:id/verify/:token Verify User email
 * @apiName Verify User email
 * @apiGroup User
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "msg": "User email verified."
    }
 */
router.get('/:id/verify/:token', async (req, res, next) => {
  if (!req.params.id && !req.params.token) res.json({
    err: 'Please provide a token and id param.'
  });
  else if (req.params.id.length !== 24)
    res.json({
      err: 'Please provide a valid id param.'
    });
  else {
    const user = await User.findById(req.params.id);
    if (req.params.token === user.verification.token) {
      user.verification.isVerified = true
      await user.save()
      res.json({
        msg: 'User email verified.'
      })
    } else {
      res.json({
        err: 'Unvalid token'
      })
    }
  }
});

/**
 * @api {post} /users/me Get User information
 * @apiName Get User Information
 * @apiGroup User
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVkZTE1MTAxZDEzOWEwMzZiNzlmNWE5In0sImlhdCI6MTU5MTYxMjY4OCwiZXhwIjoxNTkxNjIyNjg4fQ.dI-Emc4EM24Pw1KFAWJi8sOKPFusgXn_BvODpxBAV70"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
      "isActive": true,
      "_id": "5ede15101d139a036b79f5a9",
      "username": "Pip",
      "firstname": "bob",
      "lastname": "Bobby",
      "email": "bob@bob.fr",
      "password": "$2a$10$vz/zn82oA9FeJ15gveCEbe7Mw/OhKjx18EFPG2XtFJLz49eFWDLw2",
      "dateCreation": "2020-06-08T10:38:08.548Z",
      "dateOfBirth": "2020-06-08T10:38:08.548Z",
      "createdAt": "2020-06-08T10:38:08.818Z",
      "updatedAt": "2020-06-08T10:38:08.818Z",
      "__v": 0
    }
 */
router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    const tmpuser = user.toObject();
    delete tmpuser.password;
    res.json(tmpuser);
  } catch (e) {
    console.log(e)
    res.send({ message: "Error in Fetching user " });
  }
});

router.get("/unactive", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    user.isActive = false;
    await user.save()
    res.json({msg: "User unactive"})
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;
