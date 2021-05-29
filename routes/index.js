const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY


const express = require('express')
const router = express()
const fs = require('fs')

const stripe = require('stripe')(stripeSecretKey)



router.get('*', (req, res, next) => { 
    router.locals.userName = "UserXXX"
    next()
})
router.get('/', (req, res) => { 
res.render('index') 
})
router.get('/login', (req, res) => { 
    res.render('login')
        
})
router.get('/register', (req, res) => { 
    res.render('register')
        
})
router.post('/register', (req, res) => { 
    res.render('register')
        
}) 
   
router.get('/user', (req, res) => { 
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

// router.get('/css', (req, res) => {
    
//     res.send('no permition')
// })


module.exports = router