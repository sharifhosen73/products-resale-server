const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v5n2r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// Admin function
const verifyAdmin = async (req, res, next) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await usersCollection.findOne(query);

  if (user?.role !== "admin") {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

async function run() {
  try {
    const productsCollection = client.db("resaleBike").collection("products");
    const usersCollection = client.db("resaleBike").collection("users");
    const sellersCollection = client.db("resaleBike").collection("sellers");
    const commentsCollection = client.db("resaleBike").collection("comments");
    const categoriesCollection = client
      .db("resaleBike")
      .collection("categories");

    // Products
    app.get("/products", async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

    // single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    //users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    //seller
    app.get("/users/seller", async (req, res) => {
      const query = {};
      const sellers = await sellersCollection.find(query).toArray();
      res.send(sellers);
    });

    // Seller
    app.post("/users/seller", async (req, res) => {
      const seller = req.body;
      const result = await sellersCollection.insertOne(seller);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params;
      //   const decodedEmail = req.decoded.email;
      console.log("sharif", req.params);
      //   const query = { email: decodedEmail };
      //   console.log("sharif1", query);
      // const user = await usersCollection.findOne(query);
      //   const id = req.params.id;
      //   const users = await usersCollection.findOne(query);
      //   res.send(users);
    });

    //users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //comment
    app.get("/comment", async (req, res) => {
      const query = {};
      const comment = await commentsCollection.find(query).toArray();
      res.send(comment);
    });

    // comment
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    // JWT
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "5d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // Admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // Admin
    app.put("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      console.log(result);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = {};
      console.log(id);
      const categoryProduct = await productsCollection.find(query).toArray();

      const result = await categoriesCollection.find(query).toArray();

      if (id === "03") {
        res.send(categoryProduct);
      } else {
        const categoryNews = categoryProduct.filter(
          (n) => n.category_id === id
        );
        res.send(categoryNews);
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Resale Bike Server is running");
});

app.listen(port, () => {
  console.log("Resale Bike Server is running", port);
});
