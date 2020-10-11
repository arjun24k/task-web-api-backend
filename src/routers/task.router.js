const express = require("express");
const {Task} = require('../models/task.model');
const {errorParse} = require("../errorParse");
const { auth } = require("../middlewares/auth.middleware");
const taskRouter = new express.Router();

taskRouter.post('/task',auth,async (req,res)=>{
const task = new Task({
    ...req.body,
    owner:req.user._id
});
try {
    await task.save();
    res.status(201).send(task);
} catch (error) {
    res.status(400).send(errorParse(error));
}
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortByTime=newest or oldest
taskRouter.get('/task',auth,async (req,res)=>{
    const match = {};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortByTime){
        sort.createdAt = req.query.sortByTime==='newest'?-1:1
    }

    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
});

taskRouter.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(400).send({error:"Task not found"})
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(errorParse(error));
    }
});

taskRouter.patch('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidUpdate=updates.every(element=>allowedUpdates.includes(element));
    if(!isValidUpdate)
    return res.status(400).send({error:"Both description and completed are required"});

    try {
      //  const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
      const task = await Task.findOne({_id,owner:req.user._id});
      if(!task)
        throw new Error('Task not found');
        updates.forEach(update=>task[update]=req.body[update]);
        await task.save();
        return res.status(200).send(task);
    } catch (error) {
        return res.status(400).send(errorParse(error));
    }

})


taskRouter.delete('/tasks/deleteAll',auth,async (req,res)=>{
    try {
        await req.user.populate('tasks').execPopulate();
        await req.user.tasks.forEach(task => task.remove())
        res.status(200).send({msg:"All tasks deleted"});
    } catch (error) {
        return res.status(400).send(errorParse(error));
    }
})

taskRouter.delete('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id;
    try {
       // const task =await Task.findByIdAndDelete(req.params.id);
       const task =await Task.findOneAndDelete({_id,owner:req.user._id});
       console.log(task);
        if(!task){
            return res.status(400).send({error:"Task dosen't exist"})
        }
        return res.status(200).send({msg:"Task deleted successfully"});
    } catch (error) {
        return res.status(400).send(errorParse(error));
    }
})


module.exports = {
    taskRouter
};

