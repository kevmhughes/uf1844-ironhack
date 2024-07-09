// import third party modules
const express = require("express");
const morgan = require("morgan");
const getColors = require("get-image-colors");

// create an express instance
const app = express();
const port = 3000;

//middleware to log all client requests
app.use(morgan("tiny"));
// middleware to process POST requests
app.use(express.urlencoded({ extended: true }));
// middleware so the client can make GET requests to the static resources in the public folder
app.use(express.static("public"));

// database
let images = [
  {
    title: 'Dog',
    link: 'https://thumbor.forbes.com/thumbor/fit-in/1290x/https://www.forbes.com/advisor/wp-content/uploads/2023/07/top-20-small-dog-breeds.jpeg.jpg',
    date: '2024-07-25',
    category: 'animals',
    color: '81 98 22',
    colorText: '81, 98, 22'
  }
];

app.set("view engine", "ejs");

// async function that gets average color of an image, and then adds new properties
const getRgb = async (image) => {
  // gets average color using the URL
  const colors = await getColors(image.link, { count: 1 });
  // adds property with key "color" and value "rgb" (taken from get-image-colors array)
  image.color = colors[0]._rgb.slice(0, 3).join(" ");
  // adds property with key "colorText" and value "rgb" in CSV format (taken from get-image-colors array)
  image.colorText = colors[0]._rgb.slice(0, 3).join(", ");
};

// async arrow function
const addRgbToImages = async (images) => {
  // maps images array of objects adding the new properties to all of the objects
  await Promise.all(images.map((image) => getRgb(image)));
};

app.get("/", /* async */ (req, res) => {
  // async 
  res.render("home", {
    images /* only one attribute is needed if the key is the same as the value =>  images: images, */,
  });
});

// GET request to render "/add-image-form"
app.get("/add-image-form", (req, res) => {
  res.render("form", {
    isImagePosted: undefined,
    imageAlreadyAdded: undefined,
  });
});

// POST request to "/add-image-form"
app.post("/add-image-form", async  (req, res) => {
  const urltoBeUploaded = req.body.link;
  const isUrlInDatabase = images.find((i) => i.link == urltoBeUploaded);

  // redirect method of the response object
  /* res.redirect("/"); */

  if (!isUrlInDatabase) {

    images.push(req.body);

     // Process the new image to get its RGB values
    await addRgbToImages([req.body]);
    console.log([req.body])

    // sort images by date from most recent to oldest
    images = images.sort((a , b) => new Date(b.date) - new Date(a.date))

    res.render("form", {
      isImagePosted: true,
      imageAlreadyAdded: false,
    });
  } else {
    res.render("form", {
      isImagePosted: false,
      imageAlreadyAdded: true,
    });
  }
});

// DELETE request to remove a photo from array when "x" button is clicked
app.delete('/images/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (index >= 0 && index < images.length) {
      images.splice(index, 1);
      res.status(200).send('Image deleted');
  } else {
      res.status(400).send('Invalid index');
  }
});

app.listen(port, (req, res) => {
  console.log(`The server is running on port ${port}`);
});
