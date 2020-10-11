const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const {errorParse} = require("../errorParse");

const auth = async (req,res,next)=>{
    
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token});
        if(!user)
            throw new Error('User not found')
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
}



module.exports={auth};