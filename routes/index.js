var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Poll = require('../models/poll');
var passportGoogle   = require('../auth/google');
var passportTwitter  = require('../auth/twitter');
var passportFacebook = require('../auth/facebook');

var middleware = {
    querryTheDB: function(req, res, next){
    Poll.find({ },'pollTitle', function (err, polls) {
    if (err) console.log(err); 
//    Due to the asynchronous access to the db if the following 3 lines 
//    are outside of User.find function, newCont will be empty
    var pollsSecEd = polls.map(function(poll){
        var pollUrl = "poll/" + poll._id;
        var rObj = {};
        rObj["pollTitle"]=poll.pollTitle;
        rObj["url"]=pollUrl;
        return rObj;
    });    
        
    console.log('poll');
    console.log(pollsSecEd);
        
    if(!res.locals.partials) res.locals.partials = {};  
    res.locals.partials.pollTitlesContext =  pollsSecEd;
    next(); 
    })
     },
    
    getSpecificUserPhotos : function(req, res, next){
    User.find({someID:req.user.someID},'images',function (err, docs){
        if (err) console.log(err);
        var container=[];
        docs.forEach(function(elem){
        container.push(elem.images );
    });
        if(!res.locals.partials) res.locals.partials = {};
        console.log(container);
        res.locals.partials.imageUserContext =  container[0];
        next();
    })
    },
    isLoggedIn:function(req,res,next){
        if (req.isAuthenticated()){
            res.render('authUserHome');          
        }
        else {res.render('home')}
    },
    isLoggedInGen:function(req,res,next){
        if (req.isAuthenticated()){
            return next();          
        }
        else {res.redirect('/')}
    }    
}
//authenticate with facebook
router.get('/auth/facebook', passportFacebook.authenticate('facebook', { scope : "email" } ));

router.get('/auth/facebook/callback',
  passportFacebook.authenticate('facebook', { failureRedirect: '/fail' }), 
                
  function(req, res) {
    // Successful authentication
    //console.log(req.user)
    res.redirect('/');
  });


//authenticate with Google
//https://scotch.io/tutorials/easy-node-authentication-google
router.get('/auth/google', passportGoogle.authenticate('google', { scope : "openid profile email" } ));

router.get('/auth/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/fail' }), 
                
  function(req, res) {
    // Successful authentication
    //console.log(req.user)
    res.redirect('/');
  });

//authenticate with twitter

router.get('/auth/twitter', passportTwitter.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passportTwitter.authenticate('twitter', { failureRedirect: '/fail' }), 
                 
  function(req, res) {
    // Successful authentication
    res.redirect('/');
  });


router.get('/fail', function(req, res, next) {
   res.send('LOGGING IN WITH TWITTER FAILED, PLEASE TRY AGAIN')
});

router.get('/logout', function(req,res){
    req.logout();
    res.redirect('/');
});

//req.user is always available for a logged in user and this functionality comes from  init.js 
router.get('/', middleware.querryTheDB,middleware.isLoggedIn
          );

router.post('/',middleware.isLoggedInGen,/*upload.array(),*/ function (req, res) {
    var url = req.body.imageUrl;
    console.log('req body');
    console.log(req.body);
    console.log('req body');
    User.findOneAndUpdate({someID:req.user.someID},{$push:{"images":{imageAdress:req.body.imageUrl, description: req.body.description, avatar:req.user.avatar} }}, {safe: true, upsert: true, new : true}, function(err, model) {
            if (err)  {console.log(err)}
            else {res.redirect('/')}
        })
});

router.get('/myPics',middleware.isLoggedInGen,middleware.getSpecificUserPhotos, function(req,res){
    res.render('userMyPics');   
});

router.get('/newPoll',middleware.isLoggedInGen,function(req,res){
    res.render('newPoll');
});

router.post('/newPoll',middleware.isLoggedInGen,function(req,res){

var optionsArray = req.body.options.split(',');
var cont = [],
    key  = "option"; 
    
optionsArray.forEach(function(option){
    var obj={};
    obj[key]=option;
    obj["votes"]=0;
    cont.push(obj)
});
    
    var newPoll=
    new Poll({
        creatorAuthMethod: req.user.authMethod,
        someID           : req.user.someID,
        pollTitle        : req.body.pollTitle,
        options          : cont
    });
    
    newPoll.save(function(err, poll){
    if (err) console.log(err);
    var address = '/poll/'+poll._id ;    
    res.redirect(address);
    });
});

router.post('/myPics',middleware.isLoggedInGen, function (req, res) {
    var url = req.body.imageUrl;
    User.findOneAndUpdate({someID:req.user.someID},{$push:{"images":{imageAdress:req.body.imageUrl, description: req.body.description, avatar:req.user.avatar} }}, {safe: true, upsert: true, new : true}, function(err, model) {
            if (err)  {console.log(err)}
            else {res.redirect('/myPics')}
        })
});

router.get('/myPolls',middleware.isLoggedInGen, function(req,res){
Poll.find({'someID':req.user.someID,'creatorAuthMethod':req.user.authMethod},function(err,polls){
     var pollsSecEd = polls.map(function(poll){
        var rObj = {};
        rObj["pollTitle"]= poll.pollTitle;
        rObj["url"]      = "poll/" + poll._id;
        rObj["delUrl"]   = "del/" + "poll/" + poll._id; 
        return rObj;
    });    
    
    console.log('User Polls');
    console.log(polls);
    res.render('userPolls',{polls:pollsSecEd});
});
});

router.get('/poll/:id', function(req,res){
Poll.find({'_id':req.params.id},function(err,poll){
    if (req.isAuthenticated()){
        res.render('pollAuthUser',{title:poll[0].pollTitle, options:poll[0].options, votes:poll[0].votes});    }
    else {
        res.render('pollNotAuthUser',{title:poll[0].pollTitle, options:poll[0].options, votes:poll[0].votes});
    } 
});
});

router.post('/poll/:id', function(req,res){
    console.log("poll options");
   // console.log(req.headers);
  // use req.ip instead of req.headers["x-forwarded-for"]; for security reasons http://stackoverflow.com/questions/19266329/node-js-get-clients-ip?rq=1
    console.log(req.ip);
    //https://docs.mongodb.com/v3.2/reference/operator/update/positional/
    //check to see if the voter has already voted for this poll
    
if (req.user){  //if the user is logged in 
    //if user has provided a new poll option update the db
    if (req.body.newPollOption.length>=1){
          Poll.update( {_id:req.params.id},
        { $push:{options:{option:req.body.newPollOption, votes:0} } }, function(err, option) {
            if (err)  {console.log(err)}
            else {
                var address = '/poll/' + req.params.id ;
                res.redirect(address)}
        });
    }
    
    else {
    Poll.find({_id:req.params.id, 
               $or:[{"voters.IP":req.ip},{"voters.identity":req.user.someID}]
              },function(err,voter){
        if (err) console.log(err);
        else if (voter.length>0){res.send('you can not vote two times')}
        else if ( req.user.someID.length>1 ) {
             Poll.update( {_id:req.params.id, "options.option":req.body.optionsRadios},{
                 $inc: { "options.$.votes" : 1 },
                 $push:{voters:{identity:req.user.someID}}        
             }, function(err, option) {
            if (err)  {console.log(err)}
            else {
                var address = '/poll/' + req.params.id ;
                res.redirect(address)}
        });
        }
        else {
            Poll.update( {_id:req.params.id, "options.option":req.body.optionsRadios},{
                 $inc: { "options.$.votes" : 1 },
                 $push:{voters:{IP:req.ip}}        
             }, function(err, option) {
            if (err)  {console.log(err)}
            else {
                var address = '/poll/' + req.params.id ;
                res.redirect(address)}
        });
        }
    });
    }
}
else{ //if the user is not logged in
       Poll.find({_id:req.params.id, 
               "voters.IP":req.ip},
                 function(err,voter){
        if (err) console.log(err);
        else if (voter.length>0){res.send('you cant vote two times')}
        else {
            Poll.update( {_id:req.params.id, "options.option":req.body.optionsRadios},{
                 $inc: { "options.$.votes" : 1 },
                 $push:{voters:{IP:req.ip}}        
             }, function(err, option) {
            if (err)  {console.log(err)}
            else {
                var address = '/poll/' + req.params.id ;
                res.redirect(address)}
        });
        }
    });
}    
});

router.get('/del/poll/:id', function(req,res){
   Poll.findOneAndRemove({_id:req.params.id},function(err,poll){
    if (err){console.log(err)}
    else{
        console.log(poll);
        res.redirect('/myPolls')}
       
   })
});



////DELETE /poll/:id
//router.post('/del/:id', function(req,res){
//        User.findOneAndUpdate({someID:req.user.someID},{$pull:{"images":{_id:req.params.id} }}, {safe: true, upsert: true, new : true}, function(err, model) {
//            if (err)  {console.log(err)}
//            else {res.redirect('/myPics')}
//        })
//                           
//});


module.exports = router;
