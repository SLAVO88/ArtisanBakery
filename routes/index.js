const express = require('express')
const router = express.Router()



router.get('/', (req, res) => {
res.render('index')
    
})

router.get('/about', (req, res) => {
    res.render('about')
        
})

router.get('/shop', (req, res) => {
    res.render('shop/buy')
            
})


// router.get('/css', (req, res) => {
    
//     res.send('no permition')
// })


module.exports = router