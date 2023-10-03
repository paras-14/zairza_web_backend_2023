const { User } = require("../models");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const {sendingEmail }= require('../services/nodemailer');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const createUser = (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    } else {
      res.status(200)
        .send({
          message: "User Registered successfully"
        })
    }
  });

};

const getAllUser = async (req, res, next) => {
  try {
    const getUsers = await User.find();
    res.status(200).send(getUsers);
  } catch (error) {
    // res.status(500).send({ message: "internal server error" });
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password')
    }
  
    const oldUser = await User.findOne({ email })
    if (!oldUser) {
      throw new UnauthenticatedError('Invalid Credentials')
    }
   
    if (await bcrypt.compare(password, oldUser.password)) {
      const token = jwt.sign({email: oldUser.email, name: oldUser.name,phone: oldUser.phone,isZairzaMember:oldUser.isZairzaMember}, `${process.env.JWT_SECRET_KEY}`)
  
      if (res.status(201)) {
        return res.status(201).send({token :  token })
      } 
      else {
        throw new UnauthenticatedError('Invalid Credentials')
      }
    }
    res.status(401).send({message : "Invalid Credentials"})
  } catch (error) {
    // res.status(500).send(error.message);
    next(error);
  }
}


module.exports = {
  createUser,
  getAllUser,
  loginUser,
};



