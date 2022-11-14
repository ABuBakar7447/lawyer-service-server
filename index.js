const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const serviceCollection = client.db('lawyerService').collection('services');
    const reviewCollection = client.db('lawyerService').collection('reviews');

    // in order get limit service for homepage
    app.get('/service', async(req,res) =>{
      const query ={}
      const cursor = serviceCollection.find(query).sort({ "_id": -1 }).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });


    // in order to get all service for service page
    app.get('/services', async(req,res) =>{
      const query ={}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //getting service based on id
    app.get('/service/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const service = await serviceCollection.findOne(query);
      res.send(service);
    })

    //getting selecting review based on id
    app.get('/reviews/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const service = await reviewCollection.findOne(query);
      res.send(service);
    })

    //searching review that matched with the id
    app.get('/reviews', async(req,res) =>{
      console.log(req.query)
      let query ={};
      if(req.query.service_id ){
        query = {
          service_id: req.query.service_id
         
        }
      }
      
      const cursor = reviewCollection.find(query);
      const myreview = await cursor.toArray();
      res.send(myreview);
    });


    //adding service in database
    app.post('/services', async(req, res)=>{
      const review = req.body;
      const result = await serviceCollection.insertOne(review);
      res.send(result);
    });

    //addign reviews or comment in database
    app.post('/reviews', async(req, res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //deleting user review 
    app.delete('/reviews/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })


    //updating user review
    app.put('/reviews/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: ObjectId(id)};
      const userEdit = req.body;
      const option = {upsert: true}
      console.log(userEdit)
      const updateEdit = {
        $set: {
          service_name:userEdit.service_name,
          service_id:userEdit.service_id,
          user_name:userEdit.user_name,
          image_url:userEdit.image_url,
          rating:userEdit.rating,
          email:userEdit.email,
          comment:userEdit.comment,
        }
      }
      const result = await reviewCollection.updateOne(filter, updateEdit, option);
      res.send(result);
    })



    //getting user review base on email
    app.get('/userreview', async(req,res) =>{
      console.log(req.query)
      let query ={};
      if(req.query.email){
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });
  }
  finally{

  }
}

run().catch(error=> console.error(error))

app.get('/', (req, res) =>{
    res.send('server is running')
})

app.listen(port, () =>{
    console.log(`server is running on ${port}`);
})