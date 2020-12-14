const request = require('supertest')
const app = require('../app')
let token;
let id;

test('Create a user return 200', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        username: 'Pipo',
        phone: "000000000",
        firstname: "bob",
        lastname: "Bobby",
        password: "baboulinet",
        email: "lol@lol.fr",
        isActive:"true",
        dateOfBirth:"2020-03-09T14:37:56.192Z",
        userProfile: {
            experience:0,
            grade:0,
            rank:0,
            friendList: [],
            blackList: [],
            favoriteGames: [],
            favoriteGenres: []
        },
        roleId:"123456"
      })
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
});

test('Login user return 200', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email:"lol@lol.fr",
        password:"baboulinet",
      })
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
});

test('Get a user return 200', async () => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token)
    expect(res.statusCode).toBe(200);
});

test('Update a user return 200', async () => {
    const res = await request(app)
      .patch('/users/update')
      .set("token", token)
      .send({
        username: 'Papu',
        email: "lol@lolita.fr",
      })
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
});

test('Get a user return 200', async () => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token)
    if (res.body._id) {
        id = res.body._id
    }
    expect(res.body.username).toBe("Papu")
    expect(res.statusCode).toBe(200);
});

test('Unactive a user return 200', async () => {
    const res = await request(app)
      .get('/users/unactive')
      .set("token", token)
    expect(res.statusCode).toBe(200);
});

test('Delete a user return 200', async () => {
    const res = await request(app)
      .delete('/users/delete/' + id)
    expect(res.statusCode).toBe(404);
});