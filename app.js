// import third party modules
const express = require("express");
const morgan = require("morgan");
const getColors = require("get-image-colors");
// third party NPM packet that creates unique ids
const { v4: uuidv4 } = require("uuid");

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
let images = [
  {
    title: "Dog",
    link: "https://t2.gstatic.com/licensed-image?q=tbn:ANd9GcQOO0X7mMnoYz-e9Zdc6Pe6Wz7Ow1DcvhEiaex5aSv6QJDoCtcooqA7UUbjrphvjlIc",
    date: "2024-07-18",
    category: "animals",
    id: "e55185c4-303d-49fc-a4d6-516797885b6f",
    color: "171 145 96",
    colorText: "171, 145, 96",
  },
  {
    title: "dog 2",
    link: "https://cdn.britannica.com/79/232779-050-6B0411D7/German-Shepherd-dog-Alsatian.jpg",
    date: "2024-07-20",
    category: "animals",
    id: "f491d37d-bb71-4a20-93b8-d5f31d938f5c",
    color: "176 190 123",
    colorText: "176, 190, 123",
  },
  {
    title: "Cat",
    link: "https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg",
    date: "2024-08-02",
    category: "animals",
    id: "77493f20-284e-4082-ad8c-4d29c020f7f9",
    color: "210 166 133",
    colorText: "210, 166, 133",
  },
  {
    title: "Bird",
    link: "https://i.natgeofe.com/k/520e971d-7a22-4a6f-90dc-258df74e45bc/american-goldfinch_3x2.jpg",
    date: "2024-08-01",
    category: "animals",
    id: "6da8589a-99cb-46d1-b909-87f09f856de2",
    color: "90 115 65",
    colorText: "90, 115, 65",
  },
];

let categories = ["animals", "landscapes", "cars"];

app.set("view engine", "ejs");

// async function that gets predominant color of an image, and then adds new properties
const getRgb = async (image) => {
  // gets (one) predominant color using the image URL
  const colors = await getColors(image.link, { count: 1 });
  // adds property with key "color" and value "rgb" (taken from get-image-colors array)
  image.color = colors[0]._rgb.slice(0, 3).join(" ");
  // adds property with key "colorText" and value "rgb" in CSV format (taken from get-image-colors array)
  image.colorText = colors[0]._rgb.slice(0, 3).join(", ");
};

// GET request to render "/home"
app.get("/", (req, res) => {
  images = images.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(images);
  res.render("home", {
    images /* only one attribute is needed if the key is the same as the value => images: images, */,
  });
});

// GET request to render "/add-image-form"
app.get("/add-image-form", (req, res) => {
  res.render("form", {
    isImagePosted: undefined,
    imageAlreadyAdded: undefined,
    categories,
  });
});

// POST request to "/add-image-form"
app.post("/add-image-form", async (req, res) => {
  // URL of new image to be added
  const urltoBeUploaded = req.body.link;
  // checks to see if RL of new image to be added is already in the database
  const isUrlInDatabase = images.find((i) => i.link == urltoBeUploaded);

  if (!isUrlInDatabase) {
    // destructures req.body object
    const { title, link, date, category } = req.body;
    console.log("check req.body", req.body);
    // creates a unique id
    const uniqueId = uuidv4();
    // adds unique id to req.body object and assigns it to new image variable
    const newImage = { title, link, date, category, id: uniqueId };
    // passes the new image object to the async getRgb() function, which gets the predominant color of the image
    await getRgb(newImage);
    // pushes the new image object with added unique id to the database
    images.push(newImage);

    res.render("form", {
      isImagePosted: true,
      imageAlreadyAdded: false,
      categories,
    });
  } else {
    res.render("form", {
      isImagePosted: false,
      imageAlreadyAdded: true,
      categories,
    });
  }
});

app.get("/add-category", (req, res) => {
  res.render("category", {
    isCategoryAdded: undefined,
    categoryAlreadyAdded: undefined
  });
});

app.post("/add-category", (req, res) => {
  /* const categoryAlreadyAdded = categories.find() */
  console.log(req.body.category);
  const categoryFoundinDatabase = categories.find(
    (c) => c == req.body.category
  );

  // !!!! ======> check to see if the category already exist in the category array
  // !!!! ======> if it exists, send message "this category already exists"
  // !!!! ======> if it doesn't exist, send message "category has been successfully added"
  const categoryToBeAdded = req.body.category.toLowerCase();
  if (!categoryFoundinDatabase) {
    categories.push(categoryToBeAdded);
    res.render("category", {
      isCategoryAdded: true,
      categoryAlreadyAdded: false,
    });
  } else {
    res.render("category", {
      isCategoryAdded: false,
      categoryAlreadyAdded: true,
    });
  }
});

// POST request to "/images/:id/delete" to delete image from database
app.post("/images/:id/delete", (req, res) => {
  images = images.filter((i) => i.id !== req.params.id);
  res.redirect("/");
});

// GET request to search for image in database by title, and then display the filtered array
app.get("/search", (req, res) => {
  const searchQuery = req.query.title;
  const filteredImages = images.filter((i) =>
    i.title.toLowerCase().includes(searchQuery)
  );
  console.log("is it in the database", filteredImages);
  if (filteredImages.length == 0) {
    res.render("home", {
      // !!!! ======> Do I really need to render again???
      // !!!! ======> Maybe better to display a message such as => "no search results have been found."
      images,
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
