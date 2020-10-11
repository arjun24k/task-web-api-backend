const express = require('express');
const { initDb } = require('./db');
const {taskRouter} = require('./routers/task.router');
const {userRouter} = require('./routers/user.router');

initDb();

const app = express();
app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

const port = process.env.PORT || 3000;


app.listen(port,()=>{
    console.log('Server is up and running');
})


  

 

/* 

MongoClient.connect(connectionUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},(error,client) => {
    if(error)
    return console.log(error);

    const db = client.db(database);

    db.collection('users').insertOne({
        name:'Jun',
        age:21
    });
} );
MongoDB shell version v4.4.0
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
 */


