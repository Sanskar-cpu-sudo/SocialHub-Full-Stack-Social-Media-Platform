const express = require("express");
const userController = require("../controller/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const userRouter = express.Router();

// Auth
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/getuser/:id",  userController.getUserById);
userRouter.get("/seefollowers/:id",  userController.seefollowers);

// User profile operations (require auth)
userRouter.put("/upadateprofile/:id", authMiddleware, userController.updateUserProfile);
userRouter.get("/getprofile/:id", authMiddleware, userController.getUserProfile);
userRouter.delete("/deleteprofile/:id", authMiddleware, userController.deleteUserProfile);

// Follow/Unfollow (require auth)
userRouter.post("/:id/addfollow", authMiddleware, userController.addfollowers);
userRouter.delete("/:id/deletefollow", authMiddleware, userController.deletefollowers);

module.exports = userRouter;
