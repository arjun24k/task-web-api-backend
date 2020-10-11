const mongoose = require('mongoose');

const connectionUrl = process.env.MONGODB_URL;

const initDb = async () =>{
    try {
        await mongoose.connect(connectionUrl,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
            useCreateIndex:true,
            useFindAndModify:false
        });
        console.log('Connected Successfully');
    } catch (error) {
        console.log(error);
    }
    
}

module.exports = {
    initDb
}
