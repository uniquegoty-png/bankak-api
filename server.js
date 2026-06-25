const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = {};

app.post('/api/login.php', (req, res) => {
    const { account_number, password, device_id } = req.body;

    if (users[account_number]) {
        if (users[account_number].password === password) {
            return res.status(200).json({
                status: "success",
                message: "Logged in successfully",
                balance: users[account_number].balance
            });
        } else {
            return res.status(400).json({ status: "error", message: "Incorrect password" });
        }
    } else {
        users[account_number] = {
            password: password,
            device_id: device_id,
            balance: 0
        };
        return res.status(201).json({
            status: "success",
            message: "Account created successfully",
            balance: 0
        });
    }
});

app.post('/api/recharge', (req, res) => {
    const { account_number, amount } = req.body;

    if (users[account_number]) {
        users[account_number].balance += parseFloat(amount);
        return res.status(200).json({
            status: "success",
            message: "Recharged successfully",
            new_balance: users[account_number].balance
        });
    } else {
        return res.status(404).json({ status: "error", message: "Account not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
