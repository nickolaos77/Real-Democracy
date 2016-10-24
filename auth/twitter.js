var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/user');
var config = require('../config');
var init = require('./init');
    
passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret:config.twitter.consumerSecret,
    callbackURL:config.twitter.callbackURL
},
  function(accessToken, refreshToken, profile, done) {
    
    var searchQuery = {
      someID        : profile.id,
      authMethod    : "Twitter"    
    };

    var updates = {
      authMethod    : "Twitter",
      someID        : profile.id,    
      name          : profile.displayName,
      avatar        : profile.photos[0].value,
      email         : "Twitter provides no email"    
    };

    var options = {
      upsert: true,
      new   : true       
    };
//http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.V_yPi-h9601
    // update the user if s/he exists or add a new user //
      
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {//this is a mongoose function
      if(err) {
        return done(err);
      } else {  
        return done(null, user);//if there is no error returned return the user
      
      }
    });
    
  }
));

 //serialize user into the session
init();

module.exports=passport;