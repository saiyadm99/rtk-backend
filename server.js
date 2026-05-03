const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let posts = [
  { id: 1, title: "First post", body: "This is the first post" },
  { id: 2, title: "Second post", body: "This is the second post" }
];

let nextId = 3;

app.get("/", (req, res) => {
  res.json({
    message: "REST API is running"
  });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json(post);
});

app.post("/posts", (req, res) => {
  const { title, body } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const newPost = {
    id: nextId++,
    title,
    body: body || ""
  };

  posts.unshift(newPost);

  res.status(201).json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, body } = req.body;

  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  const updatedPost = {
    ...posts[index],
    ...(title !== undefined ? { title } : {}),
    ...(body !== undefined ? { body } : {})
  };

  posts[index] = updatedPost;

  res.json(updatedPost);
});

app.patch("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  posts[index] = {
    ...posts[index],
    ...req.body
  };

  res.json(posts[index]);
});

app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  posts.splice(index, 1);

  res.json({ message: "Post deleted successfully" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});