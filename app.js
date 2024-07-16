// import necessary modules
const express = require("express");
const morgan = require("morgan");
const getColors = require("get-image-colors");
const { v4: uuidv4 } = require("uuid");

// create express instance
const app = express();

// defines port: 3000 for dev; process.env.PORT for deployed app
const PORT = process.env.PORT || 3000;

//middleware setup
app.use(morgan("tiny")); // logging requests
app.use(express.urlencoded({ extended: true })); // parsing form data
app.use(express.static("public")); // serving static files

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
    title: "Canine",
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

// set view engine
app.set("view engine", "ejs");

// function to get predominant color of an image asynchronously
const getRgb = async (image) => {
  // gets (one) predominant color using the image URL
  const colors = await getColors(image.link, { count: 1 });
  // adds property with key "color" and value "rgb" (taken from get-image-colors array)
  image.color = colors[0]._rgb.slice(0, 3).join(" ");
  // adds property with key "colorText" and value "rgb" in CSV format (taken from get-image-colors array)
  image.colorText = colors[0]._rgb.slice(0, 3).join(", ");
};

// routes
app.get("/", (req, res) => {
  images.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(images);
  res.render("home", {
    messageToBeSent: undefined,
    images /* only one attribute is needed if the key is the same as the value => images: images, */,
  });
});

app.get("/add-image-form", (req, res) => {
  res.render("form", {
    isImagePosted: undefined,
    imageAlreadyAdded: undefined,
    errorMessage: undefined,
    categories,
  });
});

app.post("/add-image-form", async (req, res) => {
  const urltoBeUploaded = req.body.link;
  const isUrlInDatabase = images.find((i) => i.link == urltoBeUploaded);

  if (!isUrlInDatabase) {
    try {
      // creates a unique id
      const uniqueId = uuidv4();
      // adds unique id to req.body object and assigns it to new image variable
      const newImage = { ...req.body, id: uniqueId };
      await getRgb(newImage);
      images.push(newImage);

      res.render("form", {
        isImagePosted: true,
        imageAlreadyAdded: false,
        errorMessage: false,
        categories,
      });
    } catch (error) {
      console.error(error);
      res.render("form", {
        isImagePosted: false,
        imageAlreadyAdded: false,
        errorMessage: true,
        categories,
      })
    }
  } else {
    res.render("form", {
      isImagePosted: false,
      imageAlreadyAdded: true,
      errorMessage: false,
      categories,
    });
  }
});

app.get("/add-category", (req, res) => {
  res.render("category", {
    isCategoryAdded: undefined,
    categoryAlreadyAdded: undefined,
  });
});

app.post("/add-category", (req, res) => {
  const categoryFoundinDatabase = categories.find(
    (c) => c == req.body.category
  );
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

app.post("/images/:id/delete", (req, res) => {
  images = images.filter((i) => i.id !== req.params.id);
  res.redirect("/");
});

app.get("/search", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const searchQuery = req.query.title;

  if (!searchQuery || searchQuery.trim() === "") {
    return res.render("home", {
      messageToBeSent: true,
      images: [],
    });
  }

  const filteredImages = images.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredImages.length === 0) {
    res.render("home", {
      messageToBeSent: true,
      images: [], // Send an empty array when there are zero results
    });
  } else {
    res.render("home", {
      images: filteredImages,
      messageToBeSent: true,
    });
  }
});

// start server
app.listen(PORT, (req, res) => {
  console.log(`The server is running on port ${PORT}`);
});
