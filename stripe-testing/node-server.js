const express = require("express");
const app = express();
// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51MePU5JR76QyQ6AvVNTJ2VRD61t0hxnLt4JclIcGOPPXoKfWz3MTvmliFSEweT0Ajn8vY2mbljFcRMrxNOPtvspy00brEE1qkh"
);

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const extractDataFromRequest = (request) => {
  const { body } = request;
  const { items } = body;
  return { items };
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = extractDataFromRequest(req);

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Return credits from store.json by username; if not found, return 0.
function readCredits(username) {
  // Read the file
  const fs = require("fs");
  const data = fs.readFileSync("store.json", "utf8");
  const obj = JSON.parse(data);

  // Find the user
  const user = obj.users.find((user) => user.username === username);

  // Get the credits
  return user ? user.credits : 0;
}

app.get("/get-credits", async (req, res) => {
  // Read username from request body
  const { username } = req.body;

  const credits = readCredits(username);

  res.send({
    credits: credits,
  });
});

app.listen(4243, () => console.log("Node server listening on port 4243!"));
