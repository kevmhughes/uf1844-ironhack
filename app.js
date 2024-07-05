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
const images = [
  {
    title: "Tarsier",
    link: "https://scontent.fbcn14-1.fna.fbcdn.net/v/t39.30808-6/419044791_10160888975996001_7341947960153957418_n.jpg?stp=cp6_dst-jpg&_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_ohc=XvSG2qlZ7ZAQ7kNvgE4jmuz&_nc_ht=scontent.fbcn14-1.fna&gid=A-dD64Y1zt-oR5YRDC5hgk5&oh=00_AYCyCEjtmAbW5zF6MrZAy7017kMV7ykB_AO6Bhd4lghN1A&oe=668D02B3",
    date: "2024-07-04",
    category: "animals",
  },
  {
    title: "Coypu",
    link: "https://scontent.fbcn14-1.fna.fbcdn.net/v/t39.30808-6/417465834_10160826140581001_5317819119682968267_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=f727a1&_nc_ohc=QvleWTwcVYQQ7kNvgFQt4Hg&_nc_ht=scontent.fbcn14-1.fna&gid=A1uss7IQQ4C6zxc-6chQh16&oh=00_AYDUiMblrv6el_Mx07LU8JI7o5itJc4xXuFAc-PeV6e2uQ&oe=668CDCAC",
    date: "2024-07-04",
    category: "animals",
  },
  {
    title: "Orangutan",
    link: "https://scontent.fbcn14-1.fna.fbcdn.net/v/t39.30808-6/367465051_10160512962351001_5626482259291271616_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_ohc=9DWe2_JfUKAQ7kNvgECdigN&_nc_ht=scontent.fbcn14-1.fna&oh=00_AYAfitF1wjG4gL9WEg7gF2F8QngqGp8nC4Z1KdDoINznqw&oe=668CF458",
    date: "2024-07-04",
    category: "animals",
  },
  {
    title: "Squirrel",
    link: "https://scontent.fbcn14-1.fna.fbcdn.net/v/t39.30808-6/449633607_10161118730131001_3614059652910363683_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_ohc=XOdKuPvZsjYQ7kNvgFkJSRW&_nc_ht=scontent.fbcn14-1.fna&gid=AFU7EaxoGUmLDbp5G1-V8-T&oh=00_AYBq_QgxbTp_So3KjRUNr3puqoNihKn2C3kgw9FTH1cu6g&oe=668CD801",
    date: "2024-07-04",
    category: "animals",
  },
];

app.set("view engine", "ejs");

// async function that gets average color of an image, and then adds new properties 
const getRgb = async (image) => {
  // gets average color using the URL
  const colors = await getColors(image.link, { count: 1 });
  // adds property with key "color" and value "rgb"
  image.color = colors[0]._rgb.slice(0, 3).join(" ");
  // adds property with key "colorText" and value "rgb" in CSV format
  image.colorText = colors[0]._rgb.slice(0, 3).join(", ");
};

const addRgbToImages = async (images) => {
  // maps images array of objects adding the new properties to all of the objects
  await Promise.all(images.map((image) => getRgb(image)));
};

// GET request to render "/"
app.get("/", async (req, res) => {
  console.log(images)
  await addRgbToImages(images);
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

// POST request to
app.post("/add-image-form", (req, res) => {
  const urlUploaded = req.body.link;
  const isUrlInDatabase = images.find((i) => i.link == urlUploaded);

  // redirect method of the response object
  /* res.redirect("/"); */

  if (!isUrlInDatabase) {
    images.push(req.body);

    res.render("form", {
      isImagePosted: true,
      imageAlreadyAdded: undefined,
    });
  } else {
    res.render("form", {
      isImagePosted: undefined,
      imageAlreadyAdded: true,
    });
  }
});

app.listen(port, (req, res) => {
  console.log(`The server is running on port ${port}`);
});
