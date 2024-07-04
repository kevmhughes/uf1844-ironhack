// import third party modules
const express = require("express");
const morgan = require("morgan");

// create an express instance
const app = express();
const port = 3000;

// database
const images = [
/*   {
    title: "dog_2",
    link: "https://thumbor.forbes.com/thumbor/fit-in/1290x/https://www.forbes.com/advisor/wp-content/uploads/2023/07/top-20-small-dog-breeds.jpeg.jpg",
    date: "2024-07-02",
    tag: "animals",
  },
  {
    title: "dog_1",
    link: "https://img.freepik.com/free-photo/isolated-happy-smiling-dog-white-background-portrait-4_1562-693.jpg",
    date: "2024-07-04",
    tag: "animals",
  }, */
];

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
  const urlUploaded = req.body.link;
  const isUrlInDatabase = images.find((i) => i.link == urlUploaded);
  console.log("is URL in database", isUrlInDatabase);
  console.log("URL being uploaded", urlUploaded);
  console.log(images);

    images.push(req.body);
    res.redirect("/");

});

app.listen(port, (req, res) => {
  console.log(`The server is running on port ${port}`);
});

