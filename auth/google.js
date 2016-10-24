var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var User = require('../models/user');
var config = require('../config');
var init = require('./init');

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    
    var searchQuery = {
      someID     : profile.id,
      authMethod : "Google"        
    };

    var updates = {
      authMethod :  "Google",    
      someID     :  profile.id,
      name       :  profile.displayName,
      avatar     :  profile._json.image.url, 
      email      :  profile.emails[0].value,
      //the json has all the info    
    };

    var options = {
      upsert: true,
      new   : true    
    };

    // update the user if s/he exists or add a new user //
    User.findOneAndUpdate(searchQuery, updates, options, function(err, user) {//this is a mongoose function
      if(err) {
        return done(err);
      } else {
          console.log("user");
          console.log(user);
        return done(null, user);//if there is no error returned return the user
      }
    });
  }

));

// serialize user into the session
init();

module.exports = passport;