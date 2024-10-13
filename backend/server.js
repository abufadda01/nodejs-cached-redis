const express = require("express")
const cors = require("cors")
const connectDB = require("./db/connectDB")

require("dotenv").config()


const User = require("./models/user.model")
const redis = require("./db/redis")


const app = express() 


app.use(express.json())
app.use(cors())


app.post("/api/users/create" , async (req , res) => {
    const {name , email} = req.body
    try {
        const cachedKey = process.env.cachedKey
        const newUser = new User({email , name})
        await newUser.save()
        await redis.del(cachedKey) // to delete the cached data version after add a new user to keep the data synced
        res.status(201).json(newUser)
    } catch (error) {
        res.status(400).json({msg : `Error in creating new user : ${error}` })
    }
})



app.get("/api/users/list" , async (req , res) => {
    try {

        const cachedKey = process.env.cachedKey
        const cachedUsers = await redis.get(cachedKey)

        // if we have cached version of the data we return them as response and don't make the mongoDB call
        if(cachedUsers){ 
            console.log("cach hit")
            return res.status(200).json({users : JSON.parse(cachedUsers)}) // we parsed them because they saved as string
        }

        const users = await User.find()

        // since we reach here that means we don't have a cached version of the data so we create one for next DB fetch
        if(users.length > 0){
            await redis.set(cachedKey , JSON.stringify(users) , "EX" , 3600) // to be expired after 1 hour
            console.log("cach miss")
        }
        
        res.status(200).json(users)
    
    } catch (error) {
        res.status(400).json({msg : `Error in getting all users : ${error}` })
    }
})



const PORT = process.env.PORT || 3001

const start = async () => {
    try {
        app.listen(PORT , () => console.log(`Currency Convertor Server started on port ${PORT}`))
        await connectDB()
    } catch (error) {
        console.log(error)
    }
}


start()



// caching : temprory storing for the data to improve the performance , reduce the numbers of DB calls , reduce the time to get the response and provide better user experience

// we have 3 components :  

// 1- caching layer : the place where the data stored temprarily

// 2- Data access  : check the cached data first

// 3- Storing data :  store the data