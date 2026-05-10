const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "mysecretkey";

app.use(cors());
app.use(express.json());

let users = [];

let posts = [
  {
    id: 1,
    title: "First post",
    body: "This is the first post",
  },
  {
    id: 2,
    title: "Second post",
    body: "This is the second post",
  },
];

let nextId = 3;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "REST API is running",
  });
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
  };

  users.push(newUser);

  const token = generateToken(newUser);

  res.status(201).json({
    message: "User created successfully",
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
    },
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (item) => item.email === email && item.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

app.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  res.json(post);
});

app.post("/posts", verifyToken, (req, res) => {
  const { title, body } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  const newPost = {
    id: nextId++,
    title,
    body: body || "",
  };

  posts.unshift(newPost);

  res.status(201).json(newPost);
});

app.put("/posts/:id", verifyToken, (req, res) => {
  const id = Number(req.params.id);
  const { title, body } = req.body;

  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  const updatedPost = {
    ...posts[index],
    ...(title !== undefined ? { title } : {}),
    ...(body !== undefined ? { body } : {}),
  };

  posts[index] = updatedPost;

  res.json(updatedPost);
});

app.delete("/posts/:id", verifyToken, (req, res) => {
  const id = Number(req.params.id);

  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  posts.splice(index, 1);

  res.json({
    message: "Post deleted successfully",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});