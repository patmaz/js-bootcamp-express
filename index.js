var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var config = require('./config.js');
var eventEmitter = require('events').EventEmitter;
var emitter = new eventEmitter();
var stormpath = require('express-stormpath');

emitter.on('err', function(err){
    console.error('##### ERROR #####', err);
});
process.on('uncaughtException', function(err) {
    console.error('Uncaught error', err);
});

//middleware
app.use('/post/json', bodyParser.json());
app.use('/post/json', function(req, res, next){
    console.log('middle for /post/json', req.body);
    next();
});

app.use(stormpath.init(app, {
    expand: {
        customData: true
    }
}));

app.use('/profile', stormpath.loginRequired, require('./profile')());

// Templates
app.set('view engine', 'pug');
app.set('views','./views');

//static
app.use(express.static('static'));

//MAIN
app.get('/', stormpath.getUser, function(req, res){
    res.render('index');
});

// POSTS
app.get('/addpost', stormpath.getUser, function(req, res){
    res.render('addpost');
});

app.get('/posts', stormpath.getUser, function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) emitter.emit('err', new Error(err));
        res.render('posts', {
            title: 'Posts',
            posts: JSON.parse(data).items,
        });
    });
});

app.get('/:postid', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) emitter.emit('err', new Error(err));

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

app.post('/post/json', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) emitter.emit('err', new Error(err));
        var dataParsed = JSON.parse(data);
        dataParsed.items.push(req.body);

        fs.writeFile('./data.json', JSON.stringify(dataParsed), 'utf8', function(err){
            if (err) emitter.emit('err', new Error(err));
            res.status(200).json(null);
        });
    });
});

app.listen(3000);
app.use(function (req, res, next) {
    res.status(404).send('nope!');
});