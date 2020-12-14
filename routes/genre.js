let async = require('async/waterfall');

let express = require('express');
let router = express.Router();
let genres = require('../models/genre');

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

  //search genre by string or get all if empty
  /**
   * @api {get} /genre/genre=bombede&limit=3 Get genres
   * @apiName Get genre by string or get all if empty
   * @apiGroup Genres
   *
   * @apiParam {string} genre searchname
   * @apiParam {string} limit maxlimit
   *
   * @apiSuccessExample {json} Success-Response:
   * {
      "content": [
        {
            "_id": "5e79d7c7999ff74c5221e07f",
            "genre": "bombedeballe",
            "createdAt": "2020-03-24T09:49:59.375Z",
            "updatedAt": "2020-03-24T09:49:59.375Z",
            "__v": 0
        },
        {
            "_id": "5e79d7f9e2c5394d079259e4",
            "genre": "bombedeballe",
            "createdAt": "2020-03-24T09:50:49.438Z",
            "updatedAt": "2020-03-24T09:50:49.438Z",
            "__v": 0
        },
        {
            "_id": "5e79d803e2c5394d079259e5",
            "genre": "bombedeball",
            "createdAt": "2020-03-24T09:50:59.222Z",
            "updatedAt": "2020-03-24T09:50:59.222Z",
            "__v": 0
        },
        {
            "_id": "5e79d80ae2c5394d079259e6",
            "genre": "bombedebal",
            "createdAt": "2020-03-24T09:51:06.525Z",
            "updatedAt": "2020-03-24T09:51:06.525Z",
            "__v": 0
        },
        {
            "_id": "5e79d8996b247d4d872c67f8",
            "genre": "bombe",
            "createdAt": "2020-03-24T09:53:29.598Z",
            "updatedAt": "2020-03-24T09:53:29.598Z",
            "__v": 0
        }
      ]
  }
   */
  router.get('/', (req, res, next) => {
    let data = {};
    let query = {};
    let limit = 0;
    let offset = 0;
    if (req.query.genre) {
      data['genre'] = new RegExp(".*"+ req.query.genre +".*",'i');
    }
    query = genres.find(data);
    if (req.query.limit) {
      limit = parseInt(req.query.limit);
      query = query.limit(limit);
    }
    if (req.query.offset) {
        offset = parseInt(req.query.offset);
        query = query.skip(offset);
    }
    query.exec((err, content) => {
      if (err) {
        res.status(400).send({err: err});
        res.end();
      }
      else {
        if (content) {
          res.status(200).json({ content: content});
        }
        else {
          res.status(204).send({ content: []})
        }
        res.end()
      }
    })
  });

  //post create a genre
  /**
   * @api {post} /genre/create Create a genre
   * @apiName Create a genre
   * @apiGroup Genres
   *
   * @apiParam {string} genre name
   *
   * @apiExample {curl} Example usage:
   *     curl -i http://localhost:3100/genre/create --data {"name": "tete"}
   * @apiSuccessExample {json} Success-Response:
   * {
      "content": {
          "gameGenreId": "5e6654ecdb12dc2e340f7680",
          "genre": "TEST"
      },
      "msg": "genre created successfully."
  }
   */
  router.post('/create', async(req, res, next) => {
    //Check if genre already exist
    const errorCheck = [];
    if (req.body.genre.length === 0) {
      res.status(400).send({error : 'Genre is required ! It can\'t be an empty string...' + req.body.genre});
      res.end()
    }
    const GenreAlreadyExists = await genres.findOne({'genre': req.body.genre}, function (error, genreExists) {
        // error handling
        if (genreExists) {
          errorCheck.push(req.body.genre)
        }
    });

    genres.create(req.body, (err, content) => {
      if (err) {
        res.status(400).send({err: err})
        res.end()
      }
      else if (errorCheck.length !== 0) {
        res.status(403).send({error : 'Genre already exists by this Genre Name: ' + req.body.genre});
        res.end()
      }
      else {
        if (content) {
          res.status(200).send({content: content, msg: 'genre created successfully.'})
        } else {
          res.status(200).send({err: 'Unable to create this genre.'})
        }
        res.end()
      }
    })
  })

  /**
   * @api {put} /genre/:id Update a genre
   * @apiName Update a genre
   * @apiGroup Genres
   *
   * @apiParam {string} id id
   * @apiParam {string} genre name
   *
   * @apiExample {curl} Example usage:
   *     curl -i http://localhost:3100/genre/:id --data {"name": "tete"}
   * @apiSuccessExample {json} Success-Response:
   * {
      "content": {
        "_id": "5e79d8996b247d4d872c67f8",
        "genre": "bombe",
        "createdAt": "2020-03-24T09:53:29.598Z",
        "updatedAt": "2020-03-24T09:53:29.598Z",
        "__v": 0
      },
      "msg": "genre updated successfully."
  }
  */
  router.put('/:id', async(req, res, next) => {
    if (!req.params.id) {
      res.status(400).send({err: 'Please provide an id param.'})
      res.end()
    }
    else if (req.params.id.length !== 24) {
      res.status(422).send({err: 'Please provide a valid id param.'})
      res.end()
    }
    const errorCheck = [];
    const GenreAlreadyExists = await genres.findOne({'genre': req.body.genre}, function (error, genreExists) {
      // error handling
      if (genreExists) {
        errorCheck.push(req.body.genre)
      }
    });

    genres.updateOne(req.body, (err, content) => {
      if (err) {
        res.status(400).send({err: err})
        res.end()
      }
      else if (errorCheck.length !== 0) {
        res.status(403).send({error : 'Genre already exists by this Genre Name :' + req.body.genre});
        res.end()
      }
      else {
        if (content) {
          console.log(content)
          res.status(200).send({content: content, msg: 'genre updated successfully.'})
        } else {
          res.status(400).send({err: 'Unable to create this genre.'})
        }
        res.end()
      }
    })
  })

  //get a genre
  /**
   * @api {get} /genre/5e79d8996b247d4d872c67f8 Get a genre
   * @apiName Get a genre
   * @apiGroup Genres
   *
   * @apiParam {string} id id
   *
   * @apiSuccessExample {json} Success-Response:
   * {
      {
        "_id": "5e79d8996b247d4d872c67f8",
        "genre": "bombe",
        "createdAt": "2020-03-24T09:53:29.598Z",
        "updatedAt": "2020-03-24T09:53:29.598Z",
        "__v": 0
      }
    }
  */
  router.get('/:id', function (req, res, next) {
    if (!req.params.id) {
      res.status(400).send({err: 'Please provide an id param.'})
      res.end()
    }
    else if (req.params.id.length !== 24) {
      res.status(422).send({err: 'Please provide a valid id param.'})
      res.end()
    }
    else {
      genres.findById(req.params.id, (err, content) => {
        if (err) {
          res.status(400).send({err: err})
          res.end()
        }
        else {
          if (content) {
            res.status(200).send({content})
          } else {
            res.status(404).send({
              err: 'No genre found with this id.'
            })
          }
          res.end()
        }
      })
    }
  })

  //delete a genre
  /**
   * @api {delete} /genre/:id Delete a genre
   * @apiName Delete a genre
   * @apiGroup Genres
   *
   * @apiParam {string} id id
   *
   * @apiSuccessExample {json} Success-Response:
   * {
      "msg": "genre deleted successfully."
  }
  */
  router.delete('/:id', (req, res, next) => {
    if (!req.params.id) {
      res.status(400).send({err: 'Please provide an id param.'})
      res.end()
    }
    else if (req.params.id.length !== 24) {
      res.status(422).send({err: 'Please provide a valid id param.'})
      res.end()
    }
    else {
      genres.findByIdAndDelete(req.params.id, (err, content) => {
        if (err) {
          res.status(400).send({err: err})
          res.end()
        }
        else
        if (content) {
          res.status(200).send({
            _id: req.params.id,
            msg: 'Genre deleted successfully.'
          })
        } else {
          res.status(404).send({
            err: 'No genre found with this id.'
          })
        }
        res.end()
      })
    }
  })

  module.exports = router;
