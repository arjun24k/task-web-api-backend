const express = require('express');
const { User } = require('../models/user.model');
const { auth } = require('../middlewares/auth.middleware');
const {errorParse} = require('../errorParse');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancellationEmail } = require('../email/account');
const userRouter = new express.Router();

userRouter.post('/user/signup',async (req,res)=>{
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken();
        res.status(200).send({user,token});
    } catch (error) {
        console.log(error);
        res.status(400).send(errorParse(error))
    }
});

userRouter.get('/user/login',async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({user,token});
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
});

userRouter.get('/user/logoutAll',auth,async (req,res)=>{
    try {
       req.user.tokens = [];
        await req.user.save();
        res.send({success:true});
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
})

userRouter.post('/user/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token!==req.token;
        });
        await req.user.save();
        res.send({success:true})
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
});

userRouter.get('/user/me',auth,async (req,res)=>{
    const token = req.token;const user = req.user;
    res.send({
        token,user
    });
});

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'));
        }
        cb(undefined,true);
    }
});

userRouter.post('/user/me/avatar',auth,upload.single('profile'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({success:true});
},(error,req,res,next)=>{
    res.status(400).send(errorParse(error));
});

userRouter.delete('/user/me/avatar',auth,async (req,res)=>{
    try {
        if(req.user.avatar){  
            req.user.avatar = undefined;
            await req.user.save();
            res.send({success:true})
        }
        throw new Error('No profile pic to delete')
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
})

userRouter.get('/user/me/avatar',auth,async (req,res)=>{
    try {
        if(!req.user.avatar){
            throw new Error('No profile pic set')
        }
        res.set('Content-type','image/png');
        res.send(req.user.avatar);
    } catch (error) {
        res.status(400).send(errorParse(error))
    }
});


userRouter.patch('/user/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidUpdate = updates.every(element=>allowedUpdates.includes(element));
    
    if(!isValidUpdate){
        throw new Error('All fields are mandatory');
    }
    
    try{
       // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        updates.forEach(update=>req.user[update]=req.body[update]);
        await req.user.save();
        res.status(200).send(req.user);
    }catch(error){
        res.status(400).send(errorParse(error));
    }

});

userRouter.delete('/user/me',auth,async (req,res)=>{
    try{
       // const user = await User.findByIdAndDelete(req.params.id);
       const userDetails = [req.user.name,req.user.email];
        await req.user.remove();
        sendCancellationEmail(userDetails[1],userDetails[0]);
        res.status(200).send({success:true});
    }catch(error){
        res.status(400).send(errorParse(error));
    }
});

module.exports = {
    userRouter
}