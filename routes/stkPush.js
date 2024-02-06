const { 
  getAccessToken,
  stkPush,
  stkCallback  
} = require("../controller/MpesaExpress/stkPush");

  
  const express = require("express");
  const  STKRouter = express.Router();
  
  STKRouter.get("/access_token", getAccessToken);
  STKRouter.post("/stk_push", stkPush, stkCallback);



  module.exports =  STKRouter;