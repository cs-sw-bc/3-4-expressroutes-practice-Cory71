import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

// Let app read JSON data
app.use(express.json());

// Get data from file
const dataFile = path.join(process.cwd(), "data", "insta.json");
const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));



// GET /users - Show all users
app.get("/users", (req, res) => {
  res.json(data.users);
});

// GET /users/:id - Show one user
app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json(user);
});


// GET /posts - Show all posts (can filter them)
app.get("/posts", (req, res) => {
  let posts = [...data.posts];
  
  // Filter by hashtag
  if (req.query.hashtag) {
    posts = posts.filter(post => 
      post.hashtags.some(tag => tag.includes(req.query.hashtag))
    );
  }
  
  // Filter by likes count
  if (req.query.minLikes) {
    const minLikes = parseInt(req.query.minLikes);
    posts = posts.filter(post => post.likes >= minLikes);
  }
  
  // Filter by user name
  if (req.query.user) {
    const user = data.users.find(u => u.username === req.query.user);
    if (user) {
      posts = posts.filter(post => post.userId === user.id);
    } else {
      posts = [];
    }
  }
  
  res.json(posts);
});

// GET /posts/:id - Show one post
app.get("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = data.posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  res.json(post);
});

// GET /posts/:id/comments - Show all comments on a post
app.get("/posts/:id/comments", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = data.posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  res.json(post.comments);
});

// GET /posts/:postId/comments/:commentId - Show one comment
app.get("/posts/:postId/comments/:commentId", (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);
  
  const post = data.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }
  
  res.json(comment);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});