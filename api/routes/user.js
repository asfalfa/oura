const express = require('express')
const router = express.Router()

const User = require('../models/user')
const Order = require('../models/order')
const Clothes = require('../models/clothes')

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require('../middleware/auth');

router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }
 
        const oldUser = await User.findOne({ email });
    
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });
        
        let access_token = jwt.sign(
            { user_id: user._id, email, first_name: user.first_name, last_name: user.last_name, admin: user.admin  },
            process.env.TOKEN_KEY
        );
    
        res.status(201).json(access_token);
    } catch (err) {
        console.log(err);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, keepAlive } = req.body;

        if (!(email && password)) {
            res.status(400).send("All input is required");
        } else {
            const user = await User.findOne({ email });

            if (user && (await bcrypt.compare(password, user.password))) {
                let access_token;
                if (keepAlive == true) {
                    access_token = jwt.sign(
                        { user_id: user._id, email, first_name: user.first_name, last_name: user.last_name, admin: user.admin  },
                        process.env.TOKEN_KEY
                    );
                    
                } else {
                    access_token = jwt.sign(
                        { user_id: user._id, email, first_name: user.first_name, last_name: user.last_name, admin: user.admin },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "1h",
                        }
                    );
                }
                
                res.status(200).json(access_token);
            } else {
                res.status(400).send("Invalid Credentials");
            }
        }
    } catch (err) {
        console.log(err);
    }
});

router.get("/info", verifyToken, async (req, res) => {
    res.status(200).json(req.user);
});

router.post("/purchase", verifyToken, async (req, res) => {
    try{        
        let product_ids = [];
        for (const item of req.body){
           product_ids.push(item.id);
        }

        await Order.create({
            user: req.user.id,
            products: product_ids
        });

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
    }
});

router.get("/orders", verifyToken, async (req, res) => {
    try {
        const allOrders = await Order.find();
        const allClothes = await Clothes.find();

        const matchingOrders = allOrders.find(order => order.user === req.user.id);
        const matchingProducts = [];

        for (const product of matchingOrders.products) {
            let matchingClothes = allClothes.find(x => x.id == product);
            matchingProducts.push(JSON.stringify(matchingClothes))
        }

        matchingOrders.products = matchingProducts
        res.json([matchingOrders])
    } catch (err) {
        console.log(err);
    }
});

router.post("/update", verifyToken, async (req, res) => {
    try{
        const data = req.body;
        const user = await User.findOne({ email: req.user.email });

        if(data.first_name.toLowerCase() !== user.first_name.toLowerCase()){
            user.first_name = data.first_name;
        }
        if(data.last_name !== user.last_name.toLowerCase()){
            user.last_name = data.last_name;
        }
        if(data.email.toLowerCase() !== user.email.toLowerCase()){
            user.email = data.email.toLowerCase();
        }
        if(data.oldpassword && data.newpasword && (await bcrypt.compare(data.oldpassword, user.password))){
            encryptedPassword = await bcrypt.hash(data.newpassword, 10);
            user.password = encryptedPassword;
        }
        user.save();
        access_token = jwt.sign(
            { user_id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, admin: user.admin },
            process.env.TOKEN_KEY,
            {
                expiresIn: "1h",
            }
        );
        res.status(200).json(access_token);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;