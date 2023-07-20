const mongoose = require('mongoose');
const express = require('express');
const socket = require('socket.io');

const cors = require('cors');

const app = express();

const allowedOrigins = ['http://localhost:3001', 'http://example.com'];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};


app.use(cors(corsOptions));



const dotenv = require('dotenv');
const User = require('./models/User');
const Message = require('./models/Message');
dotenv.config({ path: './config.env' });
require('./conn');
app.use(express.json());

app.use(express.json({ limit: '10mb' })); // Adjust the limit as per your requirements

// now link the router files
app.post('/signup',async(req,res)=>{

    const {name,email,password,photo} = req.body;


    if(!name || !email || !password){
        return res.status(422).json({error:"Please filled the fields properly"});
    }

    try{

        const userExist = await User.findOne({email:email});
        if(userExist){
            return res.status(422).json({error:"User already exist"});

        }

        else {
        const user = new User({name,email,password,photo});
        await user.save();          
        res.status(201).json({message:"User registration successfully"});

        }

        

    } catch(err){

        console.log(err);
    }


})

const PORT = process.env.PORT;


//app.get('/aboutme',middleware,(req,res)=>{
 //   res.send(`Hello world from about page`);
//});
//app.get('/contact',(req,res)=>{
  //  res.send(`Hello world from contact page`);
//});
app.post('/signin',async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(422).json({error:"Please filled the fields properly"});
    }

    try{

        const userExist = await User.findOne({email:email});
        if(userExist){
            if(userExist.password === password){
                const Data= await User.find();
               return res.status(201).json({message:"User login successfully",user:Data,me:userExist});
            }
            else{
                res.status(422).json({message:"User not found"});

            }

        }
        else{
            res.status(422).json({message:"User not found"});

        }
    }catch{
        console.log(err);
    }

});



app.post('/sendmessages',async(req,res)=>{

    const {sender,receiver,message} = req.body;
    try{
        const msg = new Message({text:message,users:[sender,receiver],sender:sender});
        await msg.save(); 
        if(msg){
            res.status(201).json({message:"Message sent successfully"});

        }      
        else{
            return res.json({msg:"Failed to add msg to the database"});
        }   

    } catch(err){

        console.log(err);
    }


})





app.post('/getmessages',async(req,res)=>{


    try {
        const messages = await Message.find({
            users: { $all: req.body.users }
          });

        res.send(messages);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw error;
    }


})
  




const server = app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
})
const io = socket(server, {
    cors: {
      origin: 'http://localhost:3000', // Replace with your frontend URL
      methods: ['GET', 'POST'],
     
    },
  });
const users={};
io.on('connection', (socket) => {
  
    socket.on('login', (userId) => {
        // Store the user's socket connection
        users[userId] = socket;
    
        console.log(`User ${userId} logged in`);
      });
        
      socket.on('sendMessage', (messageData) => {
        const { sender, receiver, message } = messageData;
    
        // Retrieve the receiver's socket connection
        const receiverSocket = users[receiver];
    
        if (receiverSocket) {
          // Emit the message to the receiver
          receiverSocket.emit('receiveMessage', messageData);
        }
    
      });    

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  
