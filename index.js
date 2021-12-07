const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware    
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@test1.trceg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("A2Z-shop");
        const productCollection = database.collection("products");
        const userCollection = database.collection("users");

        // GET API (for all products)
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const employees = await cursor.toArray();
            res.send(employees);
        });

        // POST API (for add product) 
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            // console.log('added product', result);
            res.json(result);
        });

        // GET API (for single product by ID)
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        // DELETE API 
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            console.log('deleting product with id', result)
            res.json(result);
        })

        // UPDATE API 
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    productTitle: updatedProduct.productTitle,
                    productPrice: updatedProduct.productPrice,
                    productDesc: updatedProduct.productDesc,
                    productDetails: updatedProduct.productDetails,

                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', updatedProduct)
            res.json(result)
        })


        // save register data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        //Access for admin role,
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running A2Z shop server')
})

app.listen(port, () => {
    console.log('Running Server on port', port)
})