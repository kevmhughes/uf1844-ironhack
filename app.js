// import third party modules
const express = require("express");
const morgan = require("morgan");

// cteate an express instance
const app = express();
const port = 3000;

// database
const images = [];

app.set("view engine", "ejs");

//middleware
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));

// GET request to render "/"
app.get("/", (req, res) => {
  res.render("home", {
    images: images,
  });
});

// GET request to render "/add-image-form"
app.get("/add-image-form", (req, res) => {
  res.render("form");
});

// POST request to
app.post("/add-image-form", (req, res) => {
// redirect method of the response object
  res.redirect("/");
  images.push(req.body);
});

app.listen(port, (req, res) => {
  console.log(`The server is running on port ${port}`);
});
