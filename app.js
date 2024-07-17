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
    title: "Mediterranean Tree Frog",
    link: "https://i.imgur.com/TsNgISr.jpeg",
    date: "2024-06-28",
    category: "animals",
    id: "ef14a51c-8119-488e-97c2-4016302524ed",
    color: "44 59 18",
    colorText: "44, 59, 18",
  },
  {
    title: "Sunset Over Tornabous",
    link: "https://i.imgur.com/5Q9vSnX.jpg",
    date: "2024-05-24",
    category: "landscapes",
    id: "62be796f-9b06-4e08-9353-14027bbc4cd2",
    color: "198 79 10",
    colorText: "198, 79, 10",
  },
  {
    title: "Cattle Egret",
    link: "https://i.imgur.com/Ikhvo1F.jpeg",
    date: "2024-07-04",
    category: "animals",
    id: "16c1a727-128a-461b-b4cc-a55623a629dc",
    color: "72 112 37",
    colorText: "72, 112, 37",
  },
  {
    title: "Genet",
    link: "https://i.imgur.com/lULnb1J.jpeg",
    date: "2024-07-26",
    category: "animals",
    id: "77a01781-ca8f-4696-b5d7-dcecb7fb3aec",
    color: "25 24 23",
    colorText: "25, 24, 23",
  },
  {
    title: "Alpine Marmot",
    link: "https://i.imgur.com/JNsz2g3.jpeg",
    date: "2024-07-01",
    category: "animals",
    id: "dfed91bf-565a-4380-8591-1fa005a6fb73",
    color: "120 132 78",
    colorText: "120, 132, 78",
  },
  {
    title: 'Common Darter',
    link: 'https://i.imgur.com/RJNKZaS.jpeg',
    date: '2024-07-02',
    category: 'animals',
    id: '7ab38132-02eb-4b68-b3f8-184522230f9c',
    color: '45 96 10',
    colorText: '45, 96, 10'
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
      res.status(500).render("form", {
        isImagePosted: false,
        imageAlreadyAdded: false,
        errorMessage: true,
        categories,
      });
    }
  } else {
    res.status(400).render("form", {
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
    res.status(400).render("category", {
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
    return res.status(400).render("home", {
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
