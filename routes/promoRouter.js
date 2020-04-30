const express = require('express');
const Promotion = require('../models/promotions')
const Authenticate = require('../authenticate')
const cors = require('./cors');
router = express.Router();


router.param('promoId',(req,res,next,id)=>{
    Promotion.findById(id).exec((err,data)=>{
        if(err || !data){
            return res.status(400).json({
                error:"No Such a Promotion Found"
            })
        }
        req.promotion = data
        next();
    })
})


router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res)=>{
    Promotion.find().exec((err,promotions)=>{
        if(err || promotions.length == 0){
            return res.status(400).json({
                error:"Data Not Found"
            })
        }
        res.json(promotions)
    })
})
.post(cors.corsWithOptions, Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    promo = new Promotion(req.body)
    promo.save((err,promotion)=>{
        if (err || !promotion){
            return res.status(400).json({
                error:"Data is Not Saved In Database"
            })
        }
        res.json(promotion)
    })
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Promotion.remove((err,promotion)=>{
        if (err || !promotion){
            return res.status(400).json({
                error:"No Promotion Found"
            })
        }
        res.json('Promotions Deleted Successfully')
    })
})


router.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res)=>{
    res.json(req.promotion)
})
.post(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions');
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Promotion.update(
        {_id:req.promotion._id},
        {$set:req.body},
        {new:true},
        (err,data)=>{
            if(err || !data){
                return res.status(400).json({
                    error:"Promotion Cannot Updated"
                })
            }
            res.json(data)
        }
    )
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Promotion.findByIdAndRemove({_id:req.promotion._id},(err,data)=>{
        if(err || !data){
            return res.status(400).json({
                error:"Unable To Dalete Data"
            })
        }
        res.json({
            message:`data deleted of id ${data._id}`
        })
    })
   
})



module.exports = router; 