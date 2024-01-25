const express = require("express");
const mongoose = require("mongoose");
const { Card, User } = require("../db");
const { z } = require("zod");
const authMiddleware = require("../middleware/user");

const router = express.Router();

const cardZodSchema = z.object({
  name: z.string(),
  about: z.string(),
  interests: z.string().optional(),
  phone: z.string().min(10).optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  github: z.string().optional(),
  stackOverflow: z.string().optional(),
});

router.post("/businessCard", authMiddleware, async (req, res) => {
  try {
    const filteredBody = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== "")
    );

    // Validate the request body against our schema
    const validatedBody = cardZodSchema.safeParse(filteredBody);
    if (!validatedBody.success) {
      return res.status(400).json({ message: "Invalid data in your request" });
    }

    const user = await User.findOne({ username: req.username });
    if (!user) {
      return res.status(411).send("Invalid Username or Password");
    }

    const newCard = await Card.create(validatedBody.data);

    await User.updateOne(
      {
        username: user.username,
      },
      {
        $push: {
          businessCards: new mongoose.Types.ObjectId(newCard._id),
        },
      }
    );

    res.status(200).json({
      message: `Business card created successfully with business card ID: ${newCard._id}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/businessCards", authMiddleware, async (req, res) => {
  try {
    const username = req.username;
    const user = await User.findOne({ username });

    const allCards = await Card.find({
      _id: {
        $in: user.businessCards,
      },
    });

    res.status(200).json(allCards);
  } catch (err) {
    console.log("Error: " + err);
    res.status(500).send("Internal server error");
  }
});

router.delete("/deleteCard/:cardId", authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const card = await Card.find({ _id: cardId });

    if (!card) {
      return res.status(404).json({ message: "Business Card not found." });
    }

    await Card.deleteOne({ _id: cardId });

    // Remove the deleted card from the owner's collection of cards
    let user = await User.findOne({ username: req.username });
    user.businessCards = user.businessCards.filter(
      (cid) => cid.toString() !== cardId.toString()
    );
    await user.save();

    return res.json({ message: "Deleted business card with ID: ", cardId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
