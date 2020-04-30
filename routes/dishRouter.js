const express = require('express');
router = express.Router();
var cors = require('./cors')


const Authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Dish = require('../models/dishes');


router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    Dish.find()
    .populate('comments.author')
    .exec()
    .then((dishes)=>{
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.post(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin, (req,res,next)=>{
    dish = new Dish(req.body)
    dish.save()
    .then((dish)=>{
        console.log(dish)
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res,next)=>{
    Dish.remove()
    .then((resp)=>{
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err))
})


router.route('/:dishId')
.get(cors.cors,(req,res,next)=>{
    Dish.findById(req.params.dishId)
    .populate('comments.author')
    .exec()
    .then((dish)=>{
        console.log(dish)
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.post(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.end('POST operation not supported on /dishes');
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res,next)=>{
    Dish.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new :true})
    .then((dish)=>{
        console.log(dish)
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res,next)=>{
    Dish.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode =200,
        res.setHeader('Content-Type','application/json')
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err))
})



router.route('/:dishId/comments')
.get(cors.cors,(req,res,next)=>{
    Dish.findById(req.params.dishId)
    .populate('comments.author')
    .exec()
    .then((dish)=>{
        if (dish != null){
            res.statusCode =200,
            res.setHeader('Content-Type','application/json')
            res.json(dish.comments);
        }
        else{
            err = new Error(`Dish ${req.params.dishId} Not Found`)
            err.status=404
            return next(err)
        }
        
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.post(cors.corsWithOptions,Authenticate.verifyUser,(req,res,next)=>{
    Dish.findById(req.params.dishId).exec()
    .then((dish)=>{
        if (dish != null){
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dish.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })            
            }, (err) => next(err));
        }
        else{
            err = new Error(`Dish ${req.params.dishId} Not Found`)
            err.status=404
            return next(err)
        }
        
    },(err)=>next(err))
    .catch((err)=>next(err))
})
.put(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res,next)=>{
    Dish.findById(req.params.dishId)
    .then((dish)=>{
        if (dish != null){
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove()
            }
            dish.save()
            .then((dish)=>{
                res.statusCode =200,
                res.setHeader('Content-Type','application/json')
                res.json(dish);
            },(err)=>next(err))            
        }
        else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err))

})


router.route('/:dishId/comments/:commentId')
.get(cors.cors,(req,res,next)=>{
    Dish.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
    + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions,Authenticate.verifyUser,(req,res,next)=>{
    Dish.findById(req.params.dishId)
    .then((dish) => {
        /*if(dish.comments.id(req.params.commentId).author._id.equals(req.user._id) == false ){
            return res.status(400).json({
                error:"Hey you cant do it"
            })
        }*/
        if (dish != null && dish.comments.id(req.params.commentId) != null && dish.comments.id(req.params.commentId).author._id.equals(req.user._id) == false) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                Dish.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })                         
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,(req,res,next)=>{
    
    Dish.findById(req.params.dishId)
    .then((dish) => {
        
        if (dish != null && dish.comments.id(req.params.commentId) != null && dish.comments.id(req.params.commentId).author._id.equals(req.user._id) == false) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dish.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })                        
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = router;