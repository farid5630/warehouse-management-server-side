const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// warehouseStore:HNtDQJLJFfVcXu6F
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zoya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client
      .db("warehouse")
      .collection("stationary-product");

    // products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // manage product list
    app.get("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // product post
    app.post("/product", async (req, res) => {
      const newService = req.body;
      const result = await productCollection.insertOne(newService);
      res.send(result);
    });

    // product quantity updated
    app.put("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateQuantity = { $set: { quantity: updatedQuantity.quantity } };
      const stockItem = await productCollection.updateOne(
        query,
        updateQuantity,
        options
      );
      res.send({ massage: stockItem });
    });
    

    // Product Delete
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // my Product get
    app.get("/myProduct", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = productCollection.find(query);
      const myProduct = await cursor.toArray();
      res.send(myProduct);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("this is server site code");
});

app.listen(port, () => {
  console.log("this server is runing", port);
});
