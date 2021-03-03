const request = require('supertest')
const app = require('../app')
let token;
let id;
jest.setTimeout(30000);

test('Create a user return 200', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        username: "Test5",
        firstname: "Prenom",
        lastname: "Nom",
        password: "Test1234!",
        email: "test@unitaire5.fr",
        roleId:"123456"
      })
      console.log(res.body)
    if (res.body.token) {
        token = res.body.token
    }
    expect(res.statusCode).toBe(200);
});

// test('Login user return 200', async () => {
//     const res = await request(app)
//       .post('/users/login')
//       .send({
//         email:"lodqsl@lolfdsf.fr",
//         password:"baboulinffdsfset",
//       })
//     if (res.body.token) {
//         token = res.body.token
//     }
//     expect(res.statusCode).toBe(200);
// });

// test('Get a user return 200', async () => {
//     const res = await request(app)
//       .get('/users/me')
//       .set("token", token)
//     expect(res.statusCode).toBe(200);
// });

// test('Update a user return 200', async () => {
//     const res = await request(app)
//       .patch('/users/update')
//       .set("token", token)
//       .send({
//         username: 'Papu',
//         email: "lol@lolita.fr",
//       })
//     if (res.body.token) {
//         token = res.body.token
//     }
//     expect(res.statusCode).toBe(200);
// });

test('Get a user return 200', async () => {
    const res = await request(app)
      .get('/users/me')
      .set("token", token)
    if (res.body._id) {
        id = res.body._id
    }
    console.log(res.body)
    expect(res.body.username).toBe("Test5")
    expect(res.statusCode).toBe(200);
});

// test('Unactive a user return 200', async () => {
//     const res = await request(app)
//       .get('/users/unactive')
//       .set("token", token)
//     expect(res.statusCode).toBe(200);
// });

test('Delete a user return 200', async () => {
    const res = await request(app)
      .delete('/users/' + id)
    console.log(res)
    expect(res.body.msg).toBe("User deleted successfully.")
    expect(res.statusCode).toBe(200);
});