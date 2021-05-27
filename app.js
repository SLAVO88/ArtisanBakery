const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const fs = require('fs')


const express = require('express')
const app = express()

// const http = require('http') //comment when deploying
// const reload = require('reload') //comment when deploying
const expressLayouts = require('express-ejs-layouts')
const path = require('path')

const mongoose = require('mongoose')
const stripe = require('stripe')(stripeSecretKey)

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

 
const indexRouter = require('./routes/index')
app.set('view engine', 'ejs')
app.set(path.join('views', __dirname, 'views'))
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.json())
app.use('/', indexRouter)



// const server = http.createServer(app)//comment when deploying
app.listen(process.env.PORT || 3000) //comment when deploying
// server.listen(process.env.PORT || 3000)//comment when deploying
// reload(app)//comment when deploying