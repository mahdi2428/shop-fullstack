const port = process.env.PORT || 4000;
const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const app = express();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer');
const path = require('path')
const cors = require('cors')


app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://admin:Amir1379@cluster0.dpduype.mongodb.net/e-commerceitems")

const Schema = new mongoose.Schema({
    name :{
        type : String ,
        required:true , 
    },
    image : {
        type : String,
        required:true,
    },
    category : {
        type : String ,
        required:true,
    },
    new_price : {
        type : Number,
        required:true,
    },
    old_price :{
        type : Number ,
        required:true,
    },
    date : {
        type : Date ,
        default : Date.now()
    },
    available : {
        type:Boolean,
        default:true,
    }


})
const product  = mongoose.model('product' , Schema)


app.get('/',(req,res)=>{
    res.send('experss app is running')
    console.log(req.params)
})

const storage = multer.diskStorage(
    {
    destination : './upload/images',
    filename : (req , file , cb)=>{
        return cb(null , `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    } 
})

const upload = multer({storage:storage})

app.use('/images',express.static("upload/images"))



app.post('/upload',upload.single('product'),(req , res)=>{
    res.json({
        status : "success",
        image_url : `http://localhost:${port}/images/${req.file.filename}`
    })
})
app.get('/allproduct',async(req,res)=>{
    try{
        const allProducts = await product.find()
        res.status(200).json({
            status : "success",
            data : allProducts
        })
    }catch(err){
        res.send(err)
    }
})
app.get(`/allproduct/:id`,async(req,res)=>{
    try{
        const allProducts = await product.findById(req.params.id)
        res.status(200).json({
            status : "success",
            data:allProducts
        })
    }catch(err){
        res.send(err)
    }
})
app.post("/addproduct" , async(req,res)=>{
    try{
        const newproduct =await product.create({
            name : req.body.name,
            image : req.body.image,
            category : req.body.category,
            old_price: req.body.old_price,
            new_price : req.body.new_price,
            availble : req.body.available
        })
        res.status(200).json({
            status : "successful",
            newproduct
        })
    }catch(err){
        console.log(err)
        res.status(200).json({
            status : "failed",
            data : err
        })
    }
})
app.patch('/updateproduct/:id',async(req,res)=>{
    try{
        const updateproduct = await product.findByIdAndUpdate(req.params.id , req.body)
        res.status(200).json({
            status:"successful",
            updateproduct
        })
    }catch(err){
        res.send(err)
    }
})
app.delete("/remove",async(req,res)=>{
    try{
       const deleteProduct =await product.findByIdAndDelete(req.body.id) 
       res.status(201).json({
         status : "successful"
       })
    }catch(err){
        res.send("a problem is occured")
    }
    
})



const userschma = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        requierd : true
    },
    cartdata:{
        type:Object,
        default:[]
    },
    date:{
        type: Date,
        default : Date.now()
    }

})

const users = mongoose.model('users',userschma)




    
app.post('/singup',async(req,res)=>{
    try{
    let check = await users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({
            status:"failed",
            errors : "email is already existed"
        })
    }
    let cart ={};
    for(let i=0 ; i < 300 ;i++){
        cart[i]=0;
    }

    const newuser = await users.create({
        username : req.body.username,
        email : req.body.email,
        password:req.body.password
    })

    const data ={ 
            id:users.id
    }
    const token =jwt.sign(data,'secret_ecom')
    res.json({
        status : "success",
        token
    }) 
    
    }catch(err){
        console.log(err)
    }
})


app.post('/login',async(req,res)=>{
    let user = await users.findOne({email:req.body.email})
    if(user){
        const passcompare = req.body.password === user.password
        if(passcompare){
            const data ={
                users :{id:user.id}
            }
            const token = jwt.sign(data,'secret_ecom')
                res.json({
                status : 'success',
                token
            })
        }else{
            res.json({
            status : "failed",
            errors : "wrong password"
        })
        
    }
    }else{
        res.json({
            status : "failed",
            errors : "wrong email id"
        })
    }
})
app.post('/addtocart',async(req,res)=>{
    console.log(req.body)
})
app.listen(port , (err)=>{
    if(!err){
        console.log('server running on port ' + port)
    }
})