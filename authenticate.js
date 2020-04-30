var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');
const facebookTokenStrategy = require('passport-facebook-token');


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//generate a token
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,      //user = payload, secretekey
        {expiresIn: 3000000});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();   //extracting a token from a header
opts.secretOrKey = config.secretKey;

//JwtStatergy uses a token and secrete key in 1st arg and 
// callback as a payload of jwt and callbackfunction done
//done(err,user?)
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {                                    
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);  //error with user not exist
            }
            else if (user) {
                return done(null, user);  //no error with user exist
            }
            else {
                return done(null, false); //error and user not exist
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req,res,next)=>{
    if(req.user.admin != true){
        var err = new Error(`You are not authorized to perform this operation`)
        err.status = 403
        next(err);
    }
    next();
}

exports.facebookPassport = passport.use(new facebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({facebookId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });
}
));