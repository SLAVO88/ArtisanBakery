if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY



const express = require('express')
const router = express.Router()
const fs = require('fs')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('../passport-config')
const methodOverride = require('method-override')



initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const stripe = require('stripe')(stripeSecretKey)
const users = []
router.use(express.json())
router.use(express.urlencoded({extended:false}))
router.use(flash())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))

router.get('*', (req, res, next) => { 
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
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
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
router.post('/register', checkNotAuthenticated, async (req, res) => { 
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')   
        
    }
    catch{
        res.redirect('login')

    }
    
    console.log(users)
        
}) 
   
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
                items : JSON.parse(data)
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
           let total = 0 
           req.body.items.forEach(function(item){
               const itemJson = itemsArray.find(function(i) {
                   return i.id == item.id
                   total = total + itemJson.price * item.quantity
               })
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

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
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