if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY


const fs = require('fs')


const express = require('express')

const indexRouter = require('./routes/index')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const flash = require('express-flash')
const stripe = require('stripe')(stripeSecretKey)
const MongoStore = require('connect-mongo')
const app = express()

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})


app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))



// const http = require('http') //comment when deploying
// const reload = require('reload') //comment when deploying

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE_URL}),
    cookie: {maxAge: 10 * 60 * 1000}
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(function(req,res,next){
    res.locals.session = req.session
    next()
})

app.use('/', indexRouter)



const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))



app.set('view engine', 'ejs')
app.set(path.join('views', __dirname, 'views'))
app.set('layout', 'layouts/layout')



// const server = http.createServer(app)//comment when deploying
app.listen(process.env.PORT || 3000) //comment when deploying
// server.listen(process.env.PORT || 3000)//comment when deploying
// reload(app)//comment when deploying