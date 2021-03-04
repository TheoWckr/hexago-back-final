// const http = require('http');
const request = require('supertest')
const app = require('../app')
let id;



describe('CRUD Locations', () => {

  it('Create a locations return 200', async done => {
    const res = await request(app)
    .post('/locations/create')
    .send({
      locationType : 1,
      address : "24 rue pasteur",
      postCode : "92240",
      city : "Kremlin-Bicêtre"
    })
    if (res.body.content._id) {
        id = res.body.content._id
    }
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Get locations return 200', async done => {
      const res = await request(app)
        .get('/locations')
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Get a location by id return 200', async done => {
      const res = await request(app)
        .get('/locations/' + id)
      expect(res.statusCode).toBe(200);
      done()
  })

  it('Delete a locations return 200', async done => {
      const res = await request(app)
        .delete('/locations/' + id)
      expect(res.statusCode).toBe(200);
      done()
  })

});