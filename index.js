require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q12amc9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    
    const recipeCollection = client.db('recipe_book').collection('recipes')

    app.get('/top-recipes',async(req,res)=>{
      const sortFields = { likeCount: -1 };
      const limitNum = 6;
      const cursor=recipeCollection.find().sort(sortFields).limit(limitNum)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/all-recipes',async(req,res)=>{
        const cursor = recipeCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/all-recipes/:id', async(req,res)=>{
        const id= req.params.id;
        const query={_id: new ObjectId(id)}
        const result = await recipeCollection.findOne(query)
        res.send(result)
    })

    app.get('/my-recipe/:email', async(req,res)=>{
        const email =req.params.email;
        const result = await recipeCollection.find({userEmail:email}).toArray();
        res.send(result)
    })

    app.post('/add-recipe', async (req,res) =>{
        const newRecipe = req.body;
        const result =await recipeCollection.insertOne(newRecipe)
        res.send(result)
        
    })

    app.put('/my-recipe/:id', async(req,res)=>{
      const id =req.params.id;
      const filter={_id : new ObjectId(id)}
      const updatedUser = req.body
      const updateDoc={
        $set:updatedUser
      }
      const result = await recipeCollection.updateOne(filter,updateDoc)
      res.send(result)
    })


    app.delete('/my-recipe/:id',async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)};
      const result = await recipeCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/all-recipes/:id/like', async(req,res)=>{
      const id =req.params.id;
      const filter={_id : new ObjectId(id)}
      const updateDoc={
        $inc:{likeCount:1}
      }
      const result = await recipeCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Recipe Server')
})

app.listen(port,()=>{
    console.log(`Recipe server is running on Port ${port}`)
})