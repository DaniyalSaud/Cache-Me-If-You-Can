import dotenv from "dotenv";
dotenv.config({
    path:'./.env'  
})
import connectDB from  "./db/index.js";
import {app} from './app.js'


connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 5000 ,()=>{
        console.log(`⚙️  Server is running on port ${process.env.PORT }`);
    }) 
})
.catch((err)=> {
    console.log("Error in MongoDB connection-->",err)
});
