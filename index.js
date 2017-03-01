var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

//middleware
app.use('/post/json', bodyParser.json());
app.use('/post/json', function(req, res, next){
    console.log('middle for /post/json', req.body);
    next();
});
app.use('/post/form', bodyParser.urlencoded({ extended: false }));
app.use('/post/form', function(req, res, next){
    console.log('middle for /post/form', req.body);
    next();
});

// Templates
app.set('view engine', 'pug');
app.set('views','./views');

app.get('/', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) throw err;

        res.render('posts', {
            title: 'Posts',
            posts: JSON.parse(data).items
        });
    });
});

app.get('/:postid', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) throw err;

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

//GET
// according to query params
app.get('/get', function(req, res){
    var query = req.query.q;
    var path;

    if(query === 'json') {
        path = './data.json';
    } else if (query === 'forms') {
        path = './forms.txt';
    }

    fs.readFile(path, 'utf8', function(err, data){
        if (err) throw err;
        res.send(data);
    });
});

//POST
// save posts to data.json
app.post('/post/json', function(req, res){
    fs.readFile('./data.json', 'utf8', function(err, data){
        if (err) throw err;
        var dataParsed = JSON.parse(data);
        dataParsed.items.push(req.body);

        fs.writeFile('./data.json', JSON.stringify(dataParsed), 'utf8', function(err){
            if (err) throw err;
            res.send('saved');
        });
    });
});

// save forms to forms.txt
app.post('/post/form', function(req, res){
    var dataToSave = JSON.stringify(req.body) + '\n';
    fs.appendFile('./forms.txt', dataToSave, 'utf8', function(err){
        if (err) throw err;
        res.send('saved');
    });
});

app.listen(3000);
app.use(function (req, res, next) {
    res.status(404).send('nope!');
});