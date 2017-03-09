var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStartegy = require('passport-google-oauth').OAuth2Strategy;

var checkAndHandleError = require('./checkAndHandleError');
var config = require('./config.js');

var app = express();
var googleProfile = {};

//passport
passport.serializeUser(function(user, done){
    done(null, user);
});
passport.deserializeUser(function(user, done){
    done(null, user);
});
passport.use(new GoogleStartegy({
        clientID: config.CLIENT_ID,
        clientSecret:config.SECRET_KEY,
        callbackURL: config.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb){
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName,
            photo: profile.photos[0].value
        };
        cb(null, profile);
    }
));

// Templates
app.set('view engine', 'pug');
app.set('views','./views');

// Middlewares
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.status(404).send('nope!');
});
app.use(express.static('static')); // URL

// Endpoints, URI, REST, API
app.get('/', function(req, res){
    res.render('index');
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope : ['profile', 'email']
    }
));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/posts',
        failureRedirect: '/'
    }
));

//GET
// according to query params
app.get('/get', function(req, res){
    var query = req.query.q;
    var path;

    if(query === 'booyah') {
        path = __dirname + '/static/booyah.jpg';
    } else {
        path = __dirname + '/data.json';
    }

    res.sendFile(path);
});

// GET
// feedback values from form
app.get('/form', function(req, res){
    res.sendFile(__dirname + '/static/form.html');
});

app.get('/feedback', function(req, res){
    const response = {
        first_name: req.query.first_name,
        last_name: req.query.last_name
    };
    res.end(JSON.stringify(response));
});

// Get all posts from posts collection
app.get('/posts', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        checkAndHandleError(err, res);
        res.render('posts', {
            title: 'Posts',
            posts: JSON.parse(data).items,
            user: googleProfile
        });
    });
});

// Get one post from posts collection
app.get('/posts/:postid', function(req, res){
    fs.readFile('./data.jsonn', 'utf8', function(err, data){
        checkAndHandleError(err, res);

        var post = JSON.parse(data).items.filter(
                function(element, index) {
                    return element.id === req.params.postid;
                }
            )
        res.render('post', {
            post: post[0]
        });
    });
});

// Render template for creating new post
app.get('/posts/new', function(req, res){
    res.render('addpost', { user: googleProfile});
});

// Create new post in posts collection
app.post('/posts/new', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        checkAndHandleError(err, res);
        var dataParsed = JSON.parse(data);
        dataParsed.items.push(req.body);

        fs.writeFile('./data.json', JSON.stringify(dataParsed), 'utf8', function(err){
            checkAndHandleError(err, res);
            res.status(200).json(null);
        });
    });
});

app.listen(3000);
