const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  
  const totalLikes = blogs.reduce(reducer, 0)

  return totalLikes
}

const favoriteBlog = (blogs) => {
  const reducer = (accum, item) => {
    return item.likes > accum.likes
      ? accum = item
      : accum
  }
  
  const topBlog = blogs.reduce(reducer, blogs[0])

  const returnBlog = { 
    title: topBlog.title, 
    author: topBlog.author, 
    likes: topBlog.likes 
  }    

  return returnBlog
}

const mostBlogs = (blogs) => {
  const totalsArray = []

  for (blog in blogs) {
    const currentAuthor = blogs[blog].author

    if (totalsArray[0]) {

      const blogFind = totalsArray.find((element) => currentAuthor === element.author)

      if (blogFind) {
        blogFind.blogs += 1
      } else {
        totalsArray.push({
          author: blogs[blog].author, 
          blogs: 1
        })
      }

    } else {
      totalsArray.push({
        author: blogs[blog].author, 
        blogs: 1
      })
    }
  }

  const reducer = (accum, item) => {
    return item.blogs > accum.blogs
      ? accum = item
      : accum
  }
  
  const topAuthor = totalsArray.reduce(reducer, { author:"", blogs:0 })

  return {
    author: topAuthor.author,
    blogs: topAuthor.blogs
  }
}

const mostLikes = (blogs) => {
  const totalsArray = []

  for (blog in blogs) {
    const currentAuthor = blogs[blog].author

    if (totalsArray[0]) {

      const blogFind = totalsArray.find((element) => currentAuthor === element.author)

      if (blogFind) {
        blogFind.likes += blogs[blog].likes
      } else {
        totalsArray.push({
          author: blogs[blog].author, 
          likes: blogs[blog].likes
        })
      }

    } else {
      totalsArray.push({
        author: blogs[blog].author, 
        likes: blogs[blog].likes
      })
    }
  }

  const reducer = (accum, item) => {
    return item.likes > accum.likes
      ? accum = item
      : accum
  }
  
  const topAuthor = totalsArray.reduce(reducer, { author: "", likes: 0 })

  return {
    author: topAuthor.author,
    likes: topAuthor.likes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}