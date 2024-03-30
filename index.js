require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middle ware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const uri =
  "mongodb+srv://taskMate:diAvs6xqUcUa9uM9@firstpractice.poejscf.mongodb.net/?retryWrites=true&w=majority&appName=FirstPractice";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskMateUserCollection = client
      .db("taskMate")
      .collection("taskMateUsers");
    const taskMateTasksCollection = client
      .db("taskMate")
      .collection("taskMateTasks");

    // Task collection
    app.put("/taskMate/tasks/:id", async (req, res) => {
      const user = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          assignee: user.assignee,
          status: user.status,
          title: user.title,
          description: user.description,
          priority: user.priority,
          team: user.team,
          time: user.time,
        },
      };
      const result = await taskMateTasksCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/taskMate/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskMateTasksCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/taskMate/tasks", async (req, res) => {
      const result = await taskMateTasksCollection.find().toArray();
      res.send(result);
    });

    app.post("/taskMate/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskMateTasksCollection.insertOne(task);
      res.send(result);
    });

    //User data collection
    app.get("/taskMate/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await taskMateUserCollection.findOne(query);
      res.send(result);
    });

    app.get("/taskMate/users", async (req, res) => {
      const result = await taskMateUserCollection.find().toArray();
      res.send(result);
    });
    app.post("/taskMate/users", async (req, res) => {
      const user = req.body;
      const result = await taskMateUserCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
