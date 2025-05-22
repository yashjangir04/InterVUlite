const UserModel = require("../Models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async(req , res) => {
    try {
        const {username , email , password} = req.body;
        const user = await UserModel.findOne({ email });
        if(user){
            return res.status(409)
                .json({ message : "User already exists." , success : false })
        }

        const userModel = new UserModel({username ,email ,password});
        userModel.password = await bcrypt.hash(password , 10);

        await userModel.save();
        res.status(201)
            .json({
                message : "Sign Up Successfully",
                success : true
            })

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500)
            .json({
                message : "Internal Server Error",
                success : false
            })
    }
}

const login = async(req , res) => {
    try {
        const {email , password} = req.body;
        const user = await UserModel.findOne({ email });
        const errMsg = "Something Went Wrong.";
        if(!user){
            return res.status(403)
            .json({ message : errMsg, success : false })
        }
        
        const isPassEqual = await bcrypt.compare(password, user.password);
        // console.log(isPassEqual);
        if(!isPassEqual){
            return res.status(403)
                .json({ message : errMsg, success : false })
        }

        const jwtToken = jwt.sign(
            { email: user.email , _id : user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(201)
            .json({
                message : "Sign Up Successfully",
                success : true,
                jwtToken,
                email,
                username : user.username
            })

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500)
            .json({
                message : "Internal Server Error",
                success : false
            })
    }
}

module.exports = {
    signup,
    login
}