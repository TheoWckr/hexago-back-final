// const http = require('http');
const request = require('supertest')
const app = require('../app')
let id;
jest.setTimeout(30000);

describe('CRUD Genre', () => {

  it('Create a genre return 200', async done => {
    const res = await request(app)
    .post('/genre/create')
    .send({
      genre: 'Genre de test'
    })
    if (res.body.content._id) {
        id = res.body.content._id
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get genres return 200', async done => {
      const res = await request(app)
        .get('/genre')
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Get a genre return 200', async done => {
      const res = await request(app)
        .get('/genre/' + id)
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Search genres return 200', async done => {
      const res = await request(app)
        .get('/genre/?genre=Pi&limit=3')
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Update a genre return 200', async done => {
      const res = await request(app)
      .put('/genre/' + id)
      .send({
        genre: 'Genre de test modifié'
      })
      if (res.body.content._id) {
          id = res.body.content._id
      }
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Get a genre return 200', async done => {
      const res = await request(app)
        .get('/genre/' + id)
      expect(res.body.content.genre).toBe("Genre de test modifié")
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Delete a genre return 200', async done => {
      const res = await request(app)
        .delete('/genre/' + id)
      expect(res.statusCode).toBe(200);
      done()
  })

});