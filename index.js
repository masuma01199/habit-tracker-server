const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors({
  origin: ["http://localhost:5174", "https://your-habitquest.vercel.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());


const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const habitsCollection = client.db("habitTrackerDB").collection("habits");

    app.get("/", (req, res) => {
      res.send("Habit Tracker Server Running");
    });


    app.get("/habits/featured", async (req, res) => {
      const result = await habitsCollection
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/habits/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await habitsCollection
        .find({ email: email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/habits/public", async (req, res) => {
      const result = await habitsCollection.find({ isPublic: true }).toArray();
      res.send(result);
    });

    app.post("/habits", async (req, res) => {
      const habit = req.body;
      const result = await habitsCollection.insertOne(habit);
      res.send(result);
    });

    app.delete("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const result = await habitsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.patch("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const updatedHabit = req.body;
      const result = await habitsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title: updatedHabit.title,
            category: updatedHabit.category,
            isPublic: updatedHabit.isPublic, // Matches your state
          },
        }
      );
      res.send(result);
    });

    app.get("/habits/:id", async (req, res) => {
      const id = req.params.id;
      const habit = await habitsCollection.findOne({ _id: new ObjectId(id) });
      res.send(habit);
    });

    app.patch("/habits/complete/:id", async (req, res) => {
      const id = req.params.id;
      const today = new Date().toISOString().split("T")[0];
      const habit = await habitsCollection.findOne({ _id: new ObjectId(id) });

      if (!habit) return res.status(404).send({ message: "Habit not found" });

      const alreadyCompleted = habit.completionHistory?.includes(today);
      if (alreadyCompleted) return res.send({ message: "Already completed today" });

      const result = await habitsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { completionHistory: today } }
      );
      res.send(result);
    });

  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);


module.exports = app;

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});