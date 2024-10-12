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
        const newUser = new User({email , name})
        await newUser.save()
        res.status(201).json(newUser)
    } catch (error) {
        res.status(400).json({msg : `Error in creating new user : ${error}` })
    }
})


app.get("/api/users/list" , async (req , res) => {
    try {
        const users = await User.find()
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