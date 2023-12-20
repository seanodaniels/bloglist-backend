const middleware = require('../utils/middleware')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// BEGIN ROUTES
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

// Create new blog
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  if (body.title && body.url) {

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user.id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } else {
    const errorMessage = !body.title
      ? `Missing title`
      : `Missing url`
    
    console.log(errorMessage)
    response.status(400).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user
  const blogToDelete = await Blog.findById(request.params.id)

  if (!(blogToDelete)) {
    response.status(401).json({ error: 'invalid id' })
  } else if (!(user.id === blogToDelete.user.toJSON())) {
    response.status(401).json({ error: 'invalid user' })
  } else {

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  } 

  const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updateBlog)
})

// END ROUTES

module.exports = blogsRouter