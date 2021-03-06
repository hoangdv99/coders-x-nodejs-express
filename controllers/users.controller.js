const shortid = require('shortid');
const bcrypt = require('bcryptjs');
const db = require('../db');
const  cloudinary = require('cloudinary').v2;

module.exports.getUsers = function (req, res) {
    res.render('users', {
        users: db.get('users').value()
    }); 
}

module.exports.getCreateUser = function(req, res){
    res.render('create_user', {
        errors: []
    });
}

module.exports.postCreateUser = function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    bcrypt.hash(password, 10, function(err, hashedPassword){
        if(err){
            console.log(err);
        }else{
            db.get('users').push({  id: shortid.generate(),
                                    username: username,
                                    email: email,
                                    password: hashedPassword,
                                    wrongLoginCount: 0 }).write();
        }
    });
    res.redirect('/login');
}

module.exports.deleteUser = function (req, res) {
    let id = req.params.id;
    db.get('users').remove({ id: id }).write();
    res.redirect('/users');
}

module.exports.getEditUser = function (req, res) {
    res.render('edit_user', {
        id: req.params.id
    });
}

module.exports.postEditUser = function (req, res) {
    let newUsername = req.body.username;
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    
    if(req.file === undefined){
        cloudinary.uploader.upload('./public/default-avatar.png', function(error, result){
            if(error){
                console.log(error);
            }
            db.get('users').find({ id: req.params.id }).assign({ username: newUsername, email: newEmail, avatarUrl: result.url, password: newPassword}).write();
            res.redirect('/users');
            
        });
    }else{
        cloudinary.uploader.upload(req.file.path, function(error, result){
            db.get('users').find({ id: req.params.id }).assign({ username: newUsername, email: newEmail, avatarUrl: result.url, password: newPassword}).write();
            res.redirect('/users');
        });
    }
    
}