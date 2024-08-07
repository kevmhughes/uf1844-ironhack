// import necessary modules
const express = require("express");
const morgan = require("morgan");
const getColors = require("get-image-colors");
// !!!! changes made after MongoDB version - 
const mongoose = require('mongoose');



// !!!! changes made after MongoDB version -  Schema outside of mongoose connect function
const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 30,
    match: /[A-Za-z0-9 \-_]+/
  },
  link: {
    type: String,
    required: true,
    match: /^(https):\/\/[^\s/$.?#].[^\s]*$/i
  },
  date:{
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true
  },
  colorText: {
    type: String,
    required: true
  },
})

// !!!! changes made after MongoDB version -  Model outside of mongoose connect function
const Image = mongoose.model("Image", imageSchema);

// !!!! changes made after MongoDB version -  mongoose connect function
async function main() {
  try {
    await mongoose.connect('mongodb+srv://kevhughes24:kevhughes24@cluster0.qjzwuwk.mongodb.net/PhotoGallery');
    console.log("Connected to Mongoose");
  } catch (err) {
    console.error(err);
  }
}

main();

// create express instance
const app = express();

// defines port: 8080 for dev; process.env.PORT for deployed app
const PORT = process.env.PORT || 8080;

//middleware setup
app.use(morgan("tiny")); // logging requests
app.use(express.urlencoded({ extended: true })); // parsing form data
app.use(express.static("public")); // serving static files

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

let images;

// routes

app.get("/", async (req, res) => {
  // !!!! changes made after MongoDB version - finds all images in images collection in PhotoGallery database (database declared in connect function above)
  images = await Image.find().sort({ date: -1 });
  res.render("home", {
    messageToBeSent: undefined,
    images /* only one attribute is needed if the key is the same as the value => images: images, */,
  });
  console.log("three", images)
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
  // !!!! changes made after MongoDB version - checks to see if the image is already in the database
  const isUrlInDatabase = await Image.findOne({ link: urltoBeUploaded });
  console.log("one", req.body)

  if (!isUrlInDatabase) {
    try {
      await getRgb(req.body);
       // !!!! changes made after MongoDB version - saves image data to database
       console.log("two", req.body)
      await new Image(req.body).save();
      
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

app.post("/images/:_id/delete", async (req, res) => {
// !!!! changes made after MongoDB version - deletes one images using the id
  await Image.deleteOne({ _id: req.params._id });
  res.redirect("/");
});

app.get("/search", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const searchQuery = req.query.title;

  if (!searchQuery || searchQuery.trim() === "") {
    return res.status(400).render("home", {
      messageToBeSent: true,
      images: [],
    });
  }

  // !!!! changes made after MongoDB version - finds all images with title that includes the search query
  const filteredImages = await Image.find({ title: new RegExp(searchQuery, 'i') })

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
app.listen(PORT, async (req, res) => {
  console.log(`The server is running on port ${PORT}`);

});
