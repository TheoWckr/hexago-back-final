const request = require('supertest')
const app = require('../app')
let token;
let token2;
let gameId;
let eventId;
let id;
let id2;
let idGenre;
jest.setTimeout(30000);

describe('CRUD Event', () => {
  it('Create a user return 200', async done => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        username: "Test",
        firstname: "Prenom",
        lastname: "Nom",
        password: "Test1234!",
        email: "test@unitaire.fr",
      })
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Create a second user return 200', async done => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        username: "Test2",
        firstname: "Prenom2",
        lastname: "Nom2",
        password: "Test1234!",
        email: "test@unitaire2.fr",
      })
    if (res.body.token) {
        token2 = res.body.token
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get a user return 200', async done => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token)
    if (res.body._id) {
        id = res.body._id
    }
    expect(res.body.username).toBe("Test")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get a second user return 200', async done => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token2)
    if (res.body._id) {
        id2 = res.body._id
    }
    expect(res.body.username).toBe("Test2")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Create a genre return 200', async done => {
    const res = await request(app)
    .post('/genre/create')
    .send({
      genre: 'blablablait'
    })
    if (res.body.content._id) {
        idGenre = res.body.content._id
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Create a gameDetails return 200', async done => {
    const res = await request(app)
    .post('/gameDetails/create')
    .send({
      name: '7 boqds',
      author: "Bruno Cathala",
      editor: "Repos Prod",
      distributor: "Repos Prod",
      releaseDate: "2015-10-01T07:22Z",
      popularity: 9,
      playerMin: 2,
      playerMax: 2,
      gameLengthMin: 30,
      gameLengthMax: 60,
      minAge: 10,
      genres: [idGenre],
      description: "Triomphez de votre adversaire en développant et améliorant votre civilisation sur les plans civil, scientifique et militaire. 7 Wonders Duel est l'adaptation 2 joueurs de 7 Wonders."
    })
    if (res.body.gameDetails._id) {
        gameId = res.body.gameDetails._id
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Create an event return 200', async done => {
    const res = await request(app)
      .post('/event/create')
      .set("token", token)
      .send({
        duration: 90,
        date: "2015-10-01T07:22Z",
        minPlayers: 2,
        maxPlayers: 4,
        phone: "+330000000",
        details: "bobibobou",
        locationId: "Montpellier",
        listGames: [gameId],
      })
    if (res.body.content._id) {
        eventId = res.body.content._id
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get event by date return 200', async done => {
    const res = await request(app)
      .get('/event/searchlist/?date=2015-10-01T07:22Z')
    expect(res.body.content[0]._id).toBe(eventId);
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get event by location return 200', async done => {
    const res = await request(app)
      .get('/event/searchlist/?locationId=Montpellier')
    expect(res.body.content[0]._id).toBe(eventId);
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get event by game return 200', async done => {
    const res = await request(app)
      .get('/event/searchlist/?listGames=' + gameId)
    expect(res.body.content[0]._id).toBe(eventId);
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get event by id return 200', async done => {
    const res = await request(app)
      .get('/event/searchid/' + eventId)
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Update an event return 200', async done => {
    const res = await request(app)
      .put('/event/' + eventId)
      .set("token", token)
      .send({
        duration: 120,
        phone: "+331200000",
        details: "bobidsqdqsdqdqdbobou",
      })
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get event by id return 200', async done => {
    const res = await request(app)
      .get('/event/searchid/' + eventId)
    expect(res.body.content.duration).toBe(120);
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Subscribe to an event return 200', async done => {
    const res = await request(app)
      .put('/event/subscribe/' + eventId)
      .set("token", token2)
    expect(res.statusCode).toBe(200);
    done()
  })

  it('UnSubscribe to an event return 200', async done => {
    const res = await request(app)
      .put('/event/unsubscribe/' + eventId)
      .set("token", token2)
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Delete an event return 200', async done => {
    const res = await request(app)
      .delete('/event/' + eventId)
      .set("token", token)
    expect(res.body.msg).toBe("Event deleted successfully.")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Delete a user return 200', async done => {
    const res = await request(app)
      .delete('/users/' + id)
    expect(res.body.msg).toBe("User deleted successfully.")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Delete a second user return 200', async done => {
    const res = await request(app)
      .delete('/users/' + id2)
    expect(res.body.msg).toBe("User deleted successfully.")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Delete a gameDetails return 200', async done => {
    const res = await request(app)
      .delete('/gameDetails/' + gameId)
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Delete a genre return 200', async done => {
    const res = await request(app)
      .delete('/genre/' + idGenre)
    expect(res.statusCode).toBe(200);
    done()
  })

});