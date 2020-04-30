const express = require('express');
const Leader = require('../models/leaders')
const Authenticate = require('../authenticate')
const cors = require('./cors');

router = express.Router();


router.param('leaderId',(req,res,next,id)=>{
    Leader.findById(id).exec((err,data)=>{
        if(err || !data){
            return res.status(400).json({
                error:"No Such a Leader Found"
            })
        }
        req.leader = data
        next();
    })
})


router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res)=>{
    Leader.find().exec((err,leaders)=>{
        if(err || leaders.length == 0){
            return res.status(400).json({
                error:"Data Not Found"
            })
        }
        res.json(leaders)
    })
})
.post(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    leader = new Leader(req.body)
    leader.save((err,leader)=>{
        if (err || !leader){
            return res.status(400).json({
                error:"Data is Not Saved In Database"
            })
        }
        res.json(leader)
    })
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /Leaders');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Leader.remove((err,leader)=>{
        if (err || !leader){
            return res.status(400).json({
                error:"No Leader Found"
            })
        }
        res.json('Leaders Deleted Successfully')
    })
})


router.route('/:leaderId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res)=>{
    res.json(req.leader)
})
.post(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /Leaders');
})
.put(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Leader.update(
        {_id:req.leader._id},
        {$set:req.body},
        {new:true},
        (err,data)=>{
            if(err || !data){
                return res.status(400).json({
                    error:"Leader Cannot Updated"
                })
            }
            res.json(data)
        }
    )
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,Authenticate.verifyAdmin,(req,res)=>{
    Leader.findByIdAndRemove({_id:req.leader._id},(err,data)=>{
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