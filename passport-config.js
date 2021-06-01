var User = require('./models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const authenticateUser = (req, email, password, done) => {

    User.findOne({'email': email}, async function(err, user){
        
        if (user == null) {
            //first parm error=null, no user= false, 
            return done(null, false, {message: 'No user with that email'})
        }
        try {
            if (user.validPassword(password)){
                return done(null, user)

            } else {
                return done(null, false, { message: 'Password incorect' })
            }
        }
        catch(err) {
            return done(err)


        }
    
    })
}
        
const signup = (req, email, password, done) => {
    
    
        User.findOne({'email': email}, async function(err, user){
        
        if (user) {
            return done(null, false, {message: 'Email is already in use'})
        }
        try{
            
            var newUser = new User()
            
            
            newUser.name = req.body.name
            newUser.email = email
            newUser.password = newUser.encryptPassword(password)
        
            console.log(newUser)
            
            newUser.save(function(err, result){
            if (err) {
                return done(err)
            }
            return done(null, newUser)  
            })
            
        }
        
        catch(e){
            return done(e)
        }
        
    })
        
}
    

    


passport.use('login', new LocalStrategy({usernameField: 'email', passwordField: 'password', passReqToCallback: true}, authenticateUser))
passport.use('local.signup', new LocalStrategy({usernameField: 'email', passwordField: 'password', passReqToCallback: true}, signup))


passport.serializeUser((user, done) => {
    console.log(user.id) 
    return done(null, user._id)
})
passport.deserializeUser((id, done) => { 
    User.findById(id, function(err, user){
        done(err, user)
    })
})



