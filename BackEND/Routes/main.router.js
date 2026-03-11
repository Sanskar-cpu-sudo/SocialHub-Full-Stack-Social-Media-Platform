const express=require('express');
const userRouter=require("./user.router");
const postsRouter=require("./post.router");

const mainRouter=express.Router();

mainRouter.use("/users",userRouter);
mainRouter.use("/posts",postsRouter);
mainRouter.get("/",(req,res)=>{
    res.send("welcome!");
})

module.exports=mainRouter;