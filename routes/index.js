if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
// global.cartItemsNb = ""


const express = require('express')
const router = express.Router()
const fs = require('fs')
const bcrypt = require('bcrypt')
const session = require('express-session')
const passport = require('passport')

const flash = require('express-flash')

const mongoose = require('mongoose')


mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})

const MongoStore = require('connect-mongo')
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.DATABASE_URL}),
    cookie: {maxAge: 10 * 60 * 1000}
}))
router.use(flash())
router.use(passport.initialize())
router.use(passport.session())
router.use(function(req,res,next){
    res.locals.session = req.session
    next()
})

const initializePassport = require('../passport-config')
const methodOverride = require('method-override')
const ejs = require('ejs')





const stripe = require('stripe')(stripeSecretKey)
const Cart = require('../models/cart')

router.use(express.json())
router.use(express.urlencoded({extended:false}))
router.use(methodOverride('_method'))


router.get('*', (req, res, next) => { 

        if (typeof res.locals.cartQuantity === undefined){
            
       res.locals.cartQuantity = ""
       console.log(typeof res.locals.cartQuantity)
       
        
      
        }else {
            res.locals.cartQuantity = req.session.cartQuantity
            console.log("fsdfs" + res.locals.cartQuantity)
         
           
            
        }


  
    
    if (req.isAuthenticated()){
        
        res.locals.userName = req.user.name
        
    
    } else {
    res.locals.userName = ""
    
    
    
    }
    next()
})
router.get('/', (req, res) => { 
    
res.render('index') 
})
router.get('/login', checkNotAuthenticated, (req, res) => { 
    res.render('login')
        
})
router.post('/login', checkNotAuthenticated, passport.authenticate('login', {
    successRedirect: '/', 
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/logout', checkAuthenticated, (req, res) => {
  res.render('logout')
})   
router.delete('/logoutuser', (req, res) => {
    req.logout()
    res.redirect('/login')
})   

router.get('/register', checkNotAuthenticated, (req, res) => { 
    res.render('register')
        
})
router.post('/register', checkNotAuthenticated, passport.authenticate('local.signup',{
    successRedirect: '/', 
    failureRedirect: '/register',  
    failureFlash: true
})

    
    
        
) 
   
router.get('/user', checkAuthenticated, (req, res) => { 
    res.render('user')
        
})
router.get('/about', (req, res) => {
    res.render('about')
        
})

router.get('/shop', (req, res) => {
    fs.readFile('items.json', function(error, data){
        if (error) {
            res.status(500).end()
        } else {
           
            res.render('shop/buy', {
                stripePublicKey: stripePublicKey,
                items : JSON.parse(data),
                cartItems : req.session.items
            })
            
        }
    })
    
            
})

router.post('/purchase', (req, res) => {
    fs.readFile('items.json', function(error, data){
        if (error) {
            res.status(500).end()
        } else {
           const itemsJson = JSON.parse(data)
           const itemsArray = itemJson.pastry.concat(itemsJson.breads)
           var total = 0 
           req.body.items.forEach(function(item){
               const itemJson = itemsArray.find(function(i) {
                    
                   return i.id == item.id
                   
               })
               total = total + itemJson.price * item.quantity
               stripe.charges.create({
                   amount:total,
                   sourcesource: req.body.stripeTokenid,
                   currency: 'usd'
               }).then(function(){
                   console.log('Charge Successful')
                   res.json({message: 'Sucessfully purchased items'})
               }).catch(function(){
                   console.log('Charge Fail')
                   res.status(500).end()
               })
               }
           )
        }
    })
    
            
})
router.get ('/loadcart', (req, res, next) => {
    
    if (req.isAuthenticated()){
       
        Cart.findOne({'userId': req.user.email},  function(err, cart){
          
            console.log(req.user.email)
            
            
            if (cart) {
                console.log('cart:' + cart.items)
                
                 
               
                
                res.json({items: cart.items})

                
                
               
            } else {
                // req.session.cartItemsNumb
                res.json({})
                
                    
            }
            
        })
        
    } else {
    
    res.json({items: req.session.items})
    }
})

router.get('/cart', (req, res) => { 
   
    res.render('shop/cart', {
        stripePublicKey: stripePublicKey,
    
        items : req.session.items
    })
})
router.post('/cart', (req, res, next) => {
    
   
    
    
   if (req.isAuthenticated()){
    var newCart = new Cart({
        userId: req.user.email,
        items: req.body.items
        })
    // cartItemsNb = newCart.items.length
        Cart.findOne({userId: req.user.email}, function(err, cart) {
            
            
            if (cart){
                cart.remove()
            }
            
            newCart.save(function(e, result){
                if (e) {
                    console.log(e)
                } else {
                    console.log("saved successfully")
                }
            })  
        })
        
    }
    req.session.items = req.body.items


    

    // var itemsObjects = JSON.parse(res.locals.session.items)
    // console.log(itemsObjects[quantity])
    console.log(req.body.quantity)
  
    res.json({items: req.session.items})
    req.session.cartQuantity = req.body.cartQuantity
    req.session.save()

    
    
})
    
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/logout')
    }
     next()
}

router.get('/css', (req, res) => {
    
    res.send('no permission')
})


module.exports = router
