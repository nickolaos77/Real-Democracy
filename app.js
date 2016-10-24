var express         = require('express'),
    app             = express(),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    bodyParser      = require('body-parser'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    //User            = require('./models/user'), uncomment in case of problem
    PORT            = process.env.PORT || 3000,
    //url             = 'mongodb://localhost:27017/test2',
    init            = require('./auth/init'),
    url             = process.env.MONGOLAB_URI,
    routes          = require('./routes/index.js');
 
var handlebars      = require('express-handlebars').create({
        defaultLayout: 'main',
        helpers:{
            section:function(name,options){
                if(!this._sections) this._sections ={};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
//http://stackoverflow.com/questions/38138445/node3341-deprecationwarning-mongoose-mpromise
mongoose.Promise = global.Promise;
mongoose.connect(url);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+ '/public'));
app.use(session({
  secret: 'The sun is cloudy',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: url /*process.env.MONGOLAB_URI*/ })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

// the router.all('*',function(req,res){}) in the index file didn't work as expected
// to redirect all unhandled requests to the root
app.use('*', function (req, res, next) {
    res.redirect('/')
});

//catch all invalid urls to protect catch all verbs
app.listen(PORT, function(){
    console.log('Express listening on port '+ PORT + '!');
});

/*
--  Links - Bibliograply - Notes  for the entire project--

1.http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-passport/#.V_IC_ih9601
2.http://stackoverflow.com/questions/15621970/pushing-object-into-array-schema-in-mongoose
3.OReilly.Web.Development.With.Node.And.Express
4.http://stackoverflow.com/questions/9784793/chrome-is-stretching-the-height-of-my-max-width-image
5.http://stackoverflow.com/questions/92720/jquery-javascript-to-replace-broken-images
6.http://stackoverflow.com/questions/2701041/how-to-set-form-action-through-javascript
7.http://stackoverflow.com/questions/31529446/unexpected-token-in-first-line-of-html

    ------      Notes        --------
    
1.The links to the images have as default root the public folder
*/
