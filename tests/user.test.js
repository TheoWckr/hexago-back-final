const request = require('supertest')
const app = require('../app')
let token;
let id;
jest.setTimeout(30000);

describe('CRUD User', () => {
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

  it('Login user return 200', async done => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email:"test@unitaire.fr",
        password:"Test1234!",
      })
    if (res.body.token) {
        token = res.body.token
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

  it('Update a user return 200', async done => {
    const res = await request(app)
      .patch('/users/update')
      .set("token", token)
      .send({
        username: "TEST2",
        firstname: "Prenom",
        lastname: "Nom",
        password: "Test1234!",
        email: "test@unitaire2.fr",
      })
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
    done()
  });

  it('Get an updated user return 200', async done => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token)
    if (res.body._id) {
        id = res.body._id
    }
    expect(res.body.username).toBe("TEST2")
    expect(res.statusCode).toBe(200);
    done()
  })

  it('Unactive a user return 200', async done => {
    const res = await request(app)
      .get('/users/unactive')
      .set("token", token)
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

});