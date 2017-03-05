var express = require('express');
var extend = require('xtend');
var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var widgets = require('forms').widgets;

var addForm = forms.create({
    title: fields.string({
        required: true,
    }),
    content: fields.string({
        required: true,
        widget: widgets.textarea()
    })
});

var renderedForm = addForm.toHTML();

module.exports = function add() {

    var router = express.Router();

    router.get('/', function(req, res) {
        res.render('addpost', {
            form: renderedForm
        });
    });

    return router;
};