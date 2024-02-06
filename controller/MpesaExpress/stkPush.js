const axios = require('axios');
const moment = require("moment");
require('dotenv').config();
const StkRequest = require('../../model/stkRequest');
const fs = require("fs");

const getAccessToken = async () => {
  const consumer_key = process.env.CONSUMER_KEY;
  const consumer_secret = process.env.CONSUMER_SECRET;
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = `Basic ${Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64")}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });

    const accessToken = response.data.access_token;
    console.log(response.data);
    return accessToken;
  } catch (error) {
    throw error;
  }
};

const saveTransactionToDatabase = async ( 
  checkoutRequestID, status, transactionDate,
   mpesaReceiptNumber, resultDesc  ) => {

  try {
    const payment = await StkRequest.findOne({ where: { CheckoutRequestID: checkoutRequestID } });

    if (payment) {
      payment.status = status;
      payment.TransactionDate = transactionDate;
      payment.MpesaReceiptNumber = mpesaReceiptNumber;
      payment.ResultDesc = resultDesc;

      await payment.save();
      
    } else {
      console.error('Payment not found for CheckoutRequestID:', checkoutRequestID);
    }
  } catch (error) {
    console.error('Error in saving transaction to database:', error);
  }
};

const stkPush = async (req, res , next) => {
  try {
    const accessToken = await getAccessToken();

    console.log('acesssss', accessToken);

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from("174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + timestamp).toString("base64");

    const { phone: phone, amount, businessCode } = req.body;
    const cleanedPhoneNumber = phone.substring(1);
    

    console.log( cleanedPhoneNumber, amount, businessCode )

    if (!phone || !amount) {
      return res.status(400).json({ message: "Phone and amount are required in the request body" });
    }

    const data = {
      BusinessShortCode: businessCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount.toString(),
      PartyA: `254${cleanedPhoneNumber}`,
      PartyB: businessCode,
      PhoneNumber: `254${cleanedPhoneNumber}`,
      CallBackURL: "https://4612-105-163-2-151.ngrok-free.app",
      AccountReference: "Mpesa Test",
      TransactionDesc: "Testing stk push",
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await StkRequest.create({
      CheckoutRequestID: response.data.CheckoutRequestID,
      BusinessShortCode: businessCode,
      MerchantRequestID: response.data.MerchantRequestID,
      amount: amount,
      phone: cleanedPhoneNumber,
      status: 'Pending',
      reference: 'Mpesa Test',
      description: 'Testing stk push', 
      ResponseDescription: response.data. ResponseDescription,
      CustomerMessage :  response.data.CustomerMessage
    });

    
    res.json({
      status: response.status,
      data: response.data,
    });

    next();

  } catch (error) {
    console.log(error);
    res.status(500).send("❌ Request failed");
  }
};

const stkCallback = async (req, res) => {
  console.log("STK PUSH CALLBACK");

  console.log('body' , req.body )

  // const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
  // const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
  // const resultCode = req.body.Body.stkCallback.ResultCode;
  // const resultDesc = req.body.Body.stkCallback.ResultDesc;
  // const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
  // const amount = callbackMetadata.Item[0].Value;
  // const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
  // const transactionDate = callbackMetadata.Item[3].Value;
  // const phoneNumber = callbackMetadata.Item[4].Value;

  // console.log("MerchantRequestID:", merchantRequestID);
  // console.log("CheckoutRequestID:", checkoutRequestID);
  // console.log("ResultCode:", resultCode);
  // console.log("ResultDesc:", resultDesc);
  
  // console.log("Amount:", amount);
  // console.log("MpesaReceiptNumber:", mpesaReceiptNumber);
  // console.log("TransactionDate:", transactionDate);
  // console.log("PhoneNumber:", phoneNumber);

  var json = JSON.stringify(req.body);
  fs.writeFile("stkcallback.json", json, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("STK PUSH CALLBACK STORED SUCCESSFULLY");
  });
}




module.exports = {
  getAccessToken,
  stkPush,
  stkCallback
};
