require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MOMO_BASE_URL = "https://sandbox.momodeveloper.mtn.com/collection/v1_0";

const COLLECTION_KEY = process.env.COLLECTION_SUBSCRIPTION_KEY;
const COLLECTION_USER = process.env.COLLECTION_API_USER;
const COLLECTION_API_KEY = process.env.COLLECTION_API_KEY;

const DISBURSEMENT_KEY = process.env.DISBURSEMENT_SUBSCRIPTION_KEY;
const DISBURSEMENT_USER = process.env.DISBURSEMENT_API_USER;
const DISBURSEMENT_API_KEY = process.env.DISBURSEMENT_API_KEY;

// Example root route
app.get('/', (req, res) => {
  res.send('MoMo Backend is running!');
});

// 🔐 Get Access Token
async function getAccessToken() {
  const response = await axios.post(
    "https://sandbox.momodeveloper.mtn.com/collection/token/",
    null,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": COLLECTION_KEY,
        Authorization:
          "Basic " +
          Buffer.from(`${COLLECTION_USER}:${COLLECTION_API_KEY}`).toString("base64"),
      },
    }
  );
  return response.data.access_token;
}

// 📲 Request MoMo Payment
app.post("/pay", async (req, res) => {
  const { phone, amount, description, userId } = req.body;
  const referenceId = randomUUID();

  try {
    const token = await getAccessToken();

    await axios.post(
      `${MOMO_BASE_URL}/requesttopay`,
      {
        amount: amount,
        currency: "RWF",
        externalId: userId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone,
        },
        payerMessage: "Save money",
        payeeNote: description,
      },
      {
        headers: {
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": COLLECTION_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({ referenceId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
