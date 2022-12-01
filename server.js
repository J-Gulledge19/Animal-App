// Import Dependencies

require("dotenv").config()
const express = require("express")
const morgan = require("morgan") 
const methodOverride = require("method-override")
const mongoose = require("mongoose")

// Create our Express Application Object
const app = express()

// Middleware
app.use(morgan("tiny"))
app.use(methodOverride("_method"))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

// Database Connection
const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

// Establish Connection
mongoose.connect(DATABASE_URL, CONFIG)

// Events for when connection opens/disconnects/errors
mongoose.connection
.on("open", () => console.log("Connected to Mongoose"))
.on("close", () => console.log("Disconnected from Mongoose"))
.on("error", (error) => console.log(error))

// Our Models

// pull schema and model from mongoose
const {Schema, model} = mongoose

// make animal schema
const animalSchema = new Schema({
    animalType: String,
    species: String,
    extinct: Boolean,
    location: String,
    lifeExpectancy: Number,
    img: String
})

// make animal model
const Animal = model("Animal", animalSchema)

// Routes
app.get("/", (req, res) => {
    res.redirect("/animals")
})

app.get("/animals/seed", (req, res) => {

    // array of starter animals
    const startAnimals = [
          { animalType: "Alaskan Malamute", species: "Mammal", extinct: false, location: "North western shores of Alaska", lifeExpectancy: 12, img: "https://th.bing.com/th/id/OIP.71YMq1iZdBbDfpU-4hZzuQHaJQ?pid=ImgDet&rs=1"},
          { animalType: "Black Bear", species: "Mammal", extinct: false, location: "North America", lifeExpectancy: 20, img: "https://www.pennlive.com/resizer/-99YM8S7uezC3Nv-0CzAEmXzEGs=/1280x0/smart/cloudfront-us-east-1.images.arcpublishing.com/advancelocal/BYXCODRDEZE35KDS3QVOQBQYMM.jpg"},
          { animalType: "Bald Eagle", species: "Bird", extinct: false, location: "North America", lifeExpectancy: 30, img: "https://immortal.org/wp-content/uploads/2016/03/bald-eagle-1075023_1920.jpg"},
          { animalType: "Musky", species: "Fish", extinct: false, location: "North America", lifeExpectancy: 15, img: "https://th.bing.com/th/id/R.2ace0f56f4a95ab8085e7116de8ae316?rik=7xWxn1kQDwiUkg&riu=http%3a%2f%2fwww.ducks.ca%2fassets%2f2019%2f03%2f26c410797a34e28cd495301e001107f3-1000x0-c-default.jpg&ehk=eF5Ke%2foQa1RPqOZX81wSiU7e2sFBqpOTCavkWNkmm0o%3d&risl=&pid=ImgRaw&r=0"},
          { animalType: "King Cobra", species: "Reptile", extinct: false, location: "Africa and Asia", lifeExpectancy: 20, img: "https://upload.wikimedia.org/wikipedia/commons/4/4d/12_-_The_Mystical_King_Cobra_and_Coffee_Forests.jpg"},
        ]
  
    // Delete all Animals
    Animal.deleteMany({}, (err, data) => {
      // Seed Starter Animals
      Animal.create(startAnimals,(err, data) => {
          // send created Animals as response to confirm creation
          res.json(data);
        }
      );
    });
  });

// index route
app.get("/animals", (req, res) => {
    Animal.find({})
    .then((animals) => {
      res.render("animals/index.ejs", { animals });
    });
  });

  // new route
app.get("/animals/new", (req, res) => {
  res.render("animals/new.ejs")
})

// create route
app.post("/animals", (req, res) => {
  req.body.extinct = req.body.extinct === "on" ? true : false
  Animal.create(req.body, (err, animal) => {
      res.redirect("/animals")
  })
})

// edit route
app.get("/animals/:id/edit", (req, res) => {
  const id = req.params.id
  Animal.findById(id, (err, animal) => {
      res.render("animals/edit.ejs", {animal})
  })
})

//update route
app.put("/animals/:id", (req, res) => {
  const id = req.params.id
  req.body.extinct = req.body.extinct === "on" ? true : false
  Animal.findByIdAndUpdate(id, req.body, {new: true}, (err, animal) => {
      res.redirect(`/animals/${id}`)
  })
})

app.delete("/animals/:id", (req, res) => {
  const id = req.params.id
  Animal.findByIdAndRemove(id, (err, animal) => {
      res.redirect("/animals")
  })
})

// show route
app.get("/animals/:id", (req, res) => {
    const id = req.params.id

    Animal.findById(id, (err, animal) => {
        res.render("animals/show.ejs", {animal})
    })
})

// Server Listener
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`))