

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Transaction = require("./models/transaction");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());


app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(function() {
    console.log("MongoDB Connected Successfully!");
})
.catch(function(error) {
    console.log("MongoDB Connection Error:", error);
});

// USER REGISTRATION
app.post("/register", async function(req, res) {
    try {
        const { name, email, password } = req.body;

        // Check existing email
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration Successful!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration Failed",
            error: error.message
        });
    }
});
// USER LOGIN
app.post("/login", async function(req, res) {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login Successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login Failed",
            error: error.message
        });
    }
});
app.post("/add-transaction", async function(req, res) {
    try {
        const { userId, category, date, amount, type, method } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }

        const transaction = new Transaction({
            user: userId,
            category,
            date,
            amount,
            type,
            method
        });

        await transaction.save();

        res.status(201).json({
            message: "Transaction Added Successfully!",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding transaction",
            error: error.message
        });
    }
});

// UPDATE TRANSACTION
app.put("/update-transaction/:id", async function(req, res) {
    try {
        const { userId, category, date, amount, type, method } = req.body;

        const updated = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { category, date, amount, type, method },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction Updated Successfully!",
            transaction: updated
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating transaction",
            error: error.message
        });
    }
});

// DELETE TRANSACTION
app.delete("/delete-transaction/:id", async function(req, res) {
    try {
        const userId = req.query.userId;

        const deleted = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: userId
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction Deleted Successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting transaction",
            error: error.message
        });
    }
});
app.get("/transactions", async function(req, res) {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID required"
            });
        }

        const transactions = await Transaction.find({
            user: userId
        });

        res.json(transactions);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching transactions",
            error: error.message
        });
    }
});
app.get("/", function(req, res) {
    res.send("Expense Tracker Backend is Running!");
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});