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

// "database"
let images = [  {
  title: 'nok',
  link: 'https://imageio.forbes.com/specials-images/imageserve/5faad4255239c9448d6c7bcd/Best-Animal-Photos-Contest--Close-Up-Of-baby-monkey/960x0.jpg?format=jpg&width=960',
  date: '2024-08-04',
  category: 'animals',
  color: '69 57 48',
  colorText: '69, 57, 48'
},
{
  title: '124',
  link: 'https://thumbs.dreamstime.com/b/jaguar-watercolor-predator-animals-wildlife-wild-cat-leopard-design-t-shirt-107432074.jpg',
  date: '2024-07-13',
  category: 'animals',
  color: '233 226 219',
  colorText: '233, 226, 219'
}];

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

app.get("/", (req, res) => {
  console.log("images => app.get(/)", images);
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
app.post("/add-image-form", async (req, res) => {
  const urltoBeUploaded = req.body.link;
  const isUrlInDatabase = images.find((i) => i.link == urltoBeUploaded);

  if (!isUrlInDatabase) {
    images.push(req.body);
    // Process the new image to get its RGB values
    await addRgbToImages([req.body]);
    console.log("req.body => app.post", [req.body]);

    // sort images by date from most recent to oldest
    images = images.sort((a, b) => new Date(b.date) - new Date(a.date));

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
app.delete("/images/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (index >= 0 && index < images.length) {
    images.splice(index, 1);
    res.status(200).send("Image deleted");
  } else {
    res.status(400).send("Invalid index");
  }
});

app.get("/search", (req, res) => {
  const searchQuery = req.query.title;
  const filteredImages = images.filter(
    (i) => i.title.toLowerCase().includes(searchQuery)
  );
  console.log("is it in the database", filteredImages);
  if (filteredImages.length == 0) {
    res.render("home", {
      // Do I really need to render again??? 
      // Maybe better to display a message such as => "no search results have been found."
      images: images,
    });
  } else if (filteredImages.length > 0) {
    res.render("home", {
      images: filteredImages,
      // modify message according to search results => Number of images in the gallery: 2
    });
  }
});

app.listen(port, (req, res) => {
  console.log(`The server is running on port ${port}`);
});
