const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const fs = require('fs')


const express = require('express')
const app = express()
const indexRouter = require('./routes/index')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(expressLayouts)
app.use(express.static('public'))
app.use('/', indexRouter)


// const http = require('http') //comment when deploying
// const reload = require('reload') //comment when deploying


const mongoose = require('mongoose')
const stripe = require('stripe')(stripeSecretKey)

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})

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