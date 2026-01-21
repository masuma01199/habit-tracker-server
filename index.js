const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
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
    await client.connect();
    const habitsCollection = client.db("habitTrackerDB").collection("habits");

    // Test route
    app.get("/", (req, res) => {
      res.send("Habit Tracker Server Running");
    });

    // Get latest 6 habits
    app.get("/habits/featured", async (req, res) => {
      const result = await habitsCollection
        .find({ visibility: "public" })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/habits/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await habitsCollection
       .find({ userEmail: email })
       .sort({ createdAt: -1 })
       .toArray();

     res.send(result);
    });

  } finally {}
}
run().catch(console.dir);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
