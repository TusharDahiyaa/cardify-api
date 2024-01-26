const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../db");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

const router = express.Router();

const userZodSchema = z.object({
  username: z.string().min(3).email(),
  password: z.string().min(6),
  repeatPassword: z.string().min(6),
});

router.post("/signup", async (req, res) => {
  try {
    // Validate the request body against our schema
    const validatedBody = userZodSchema.safeParse(req.body);
    if (!validatedBody.success) {
      return res.status(411).send({ error: "Invalid inputs" });
    }

    if (validatedBody.password !== validatedBody.repeatPassword) {
      return res.status(409).send({ error: "Passwords do not match!" });
    }

    delete validatedBody.data["repeatPassword"];

    // Create a new user from the validated data
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(401).json({ error: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...validatedBody.data, password: hashedPassword });
    // Save the user to the database and sending back the user information
    await user.save();
    res.status(200).json({
      msg: "User created successfully",
    });
  } catch (e) {
    console.log(e);
    // If there was an error, send it back as http response with status code 40
    return res.status(500).send("Internal server error");
  }
});

router.post("/signin", async (req, res) => {
  try {
    // Find the user by their username in the database
    const user = await User.findOne({ username: req.body.username });
    // If no user is found, send back a 401 unauthorized response
    if (!user)
      return res
        .status(401)
        .json({ type: "No user found with this email address" });

    // Check that the password provided matches the one stored in the database
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(401).json({ type: "Incorrect password" });

    // Send back the user's profile information along with a token for them to use
    const token = jwt.sign(req.body.username, JWT_SECRET);
    res.status(200).json(token);
  } catch (e) {
    console.log("Error: " + e.message);
    return res
      .status(401)
      .json({ type: "error", message: "Wrong email or password!" });
  }
});

module.exports = router;
