var ids = {
  twitter: { //https://apps.twitter.com/
    consumerKey     : process.env.consumerKey,
    consumerSecret  : process.env.consumerSecret,
    callbackURL     : process.env.callbackURL,
  },
    google:{ //https://console.developers.google.com/apis/credentials/oauthclient/
    clientID        : process.env.googleClientId,
    clientSecret    : process.env.googleClientSecret,
    callbackURL     : process.env.googleCallbackUrl,    
    },
    facebook : { //https://developers.facebook.com/apps/
    clientID       :  process.env.facebookClientId, // your App ID
    clientSecret   :  process.env.facebookClientSecret, // your App Secret
    callbackURL    :  process.env.facebookCallbackUrl,
    },
};

module.exports = ids;

