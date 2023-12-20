const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

// need 'let authHeader'

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogList.map(
    blog => new Blog(blog)
  )
  const promiseArray = blogObjects.map(r => r.save())

  await Promise.all(promiseArray)

  // should add code to prep a single user entry: delete all existing,
  // grab the first user from the helper, login with said user,
  // then store the authorization code into a constant (initially declare
  // this outside the describe block.
})

test('test that makes an HTTP GET request to the /api/blogs URL', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogList.length)
})

test('unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()

})

test('verify that new entries can be created via POST', async () => {
  const newUser = {
    username: 'sean',
    name: 'Sean ODaniels',
    password: 'secret'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const newLogin = await api
    .post('/api/login')
    .send({
      username: 'sean',
      password: 'secret'
    })

  const currentToken = newLogin.body.token
  
  const newEntry = {
    title: 'This is a test for a new blog list entry.',
    author: 'Sean ODaniels',
    url: 'https://odaniels.org',
    likes: 88
  }

  await api
    .post('/api/blogs')
    .send(newEntry)
    .set({ Authorization: `Bearer ${currentToken}` })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const modifiedDb = await helper.allEntriesInDb()

  expect(modifiedDb).toHaveLength(helper.initialBlogList.length + 1)

  const titles = modifiedDb.map(r => r.title)

  expect(titles).toContain(
    'This is a test for a new blog list entry.'
  )

  await User.deleteMany({})

})

test('verify that new entries fail if token not provided', async () => {
  const newUser = {
    username: 'sean',
    name: 'Sean ODaniels',
    password: 'secret'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const newLogin = await api
    .post('/api/login')
    .send({
      username: 'sean',
      password: 'secret'
    })

  const currentToken = newLogin.body.token
  
  const newEntry = {
    title: 'This is a test for a new blog list entry.',
    author: 'Sean ODaniels',
    url: 'https://odaniels.org',
    likes: 88
  }

  await api
    .post('/api/blogs')
    .send(newEntry)
    .expect(401)

  await User.deleteMany({})

})



test('verifies that if like property is missing it is set to 0', async () => {
  const entryWithoutLikes = {
    title: 'This is a test for an absent like property a8923iIdkzqlp88.',
    author: 'Sean ODaniels',
    url: 'https://odaniels.org'
  }

  await api
    .post('/api/blogs')
    .send(entryWithoutLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const modifiedDb = await helper.allEntriesInDb()

  const newEntry = modifiedDb.find(entry => entry.title === 'This is a test for an absent like property a8923iIdkzqlp88.')

  expect(newEntry.likes).toBe(0)
})

test('verify 400 when missing title property', async () => {
  const entryWithoutTitle = {
    author: 'Sean ODaniels',
    url: 'https://odaniels.org',
    likes: 22
  }

  const response = await api.post('/api/blogs').send(entryWithoutTitle)

  expect(response.status).toBe(400)
})

test('verify delete works properly', async () => {
  const initialContentsOfDb = await helper.allEntriesInDb()
  const condemnedEntry = initialContentsOfDb[0]

  await api
    .delete(`/api/blogs/${condemnedEntry.id}`)
    .expect(204)

  const postDeleteContentsOfDb = await helper.allEntriesInDb()

  expect(postDeleteContentsOfDb).not.toContain(condemnedEntry.title)

})

test('verify update via put', async () => {
  const initialContent = await helper.allEntriesInDb()
  const changedEntry = initialContent[0]

  changedEntry.title = `Put change for ${changedEntry.id}`

  await api
    .put(`/api/blogs/${changedEntry.id}`).send(changedEntry)
    .expect(200)

  const currentContent = await helper.allEntriesInDb()
  const titles = currentContent.map(r => r.title)

  expect(titles).toContain(`Put change for ${changedEntry.id}`)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const userNames = usersAtEnd.map(user => user.username)
    expect(userNames).toContain(newUser.username)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})