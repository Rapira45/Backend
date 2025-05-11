const express = require('express')
const cors = require('cors')
const encodePassword = require('./crypto').encodePassword
const app = express()

app.use(cors())
app.use(express.json())

let users = []

app.post('/sign-up', (req, res) => { 
    const { email , password } = req.body;
     if (!email || !password) {
        return res.status(400).json({message: 'Email and password are required!' })
    }
    if (password.length < 8) {
        return res.status(400).json({message : 'Password length should be minimum 8 symbols!!' })
    }
    if(users.find((user) => user.email === email)) {
       return res.status(400).json({message: 'User with this email already exists!' })
    }
    const newUser = {
        id:Date.now(),
        email, 
        password : encodePassword(password),
        balance: 0,
        coinsPerClick: 1,
        passiveIncomePerSecond: 1
    }
    users.push(newUser)
    res.status(201).json({
    message: "Registered succesfully!",
    user: { id: newUser.id, email: newUser.email, balance: newUser.balance, coinsPerClick: newUser.coinsPerClick, passiveIncomePerSecond: newUser.passiveIncomePerSecond}
});
});

app.post('/sign-in', (req, res) => {
    const { email , password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message: 'Email and password are required!' })
    }
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'User not found!' });
    }

    if (user.password !== encodePassword(password)) {
       return res.status(401).json({ message: 'Invalid password!' });
    }
    
    return res.status(200).json({ message: 'Login successful!',  user: {id: user.id, email: user.email, balance: user.balance, coinsPerClick: user.coinsPerClick, passiveIncomePerSecond: user.passiveIncomePerSecond}
    })
})

let upgrades = [
    { id: 1, name: "Click Accelerator", description: "speed of earning x10", price: 40000 },
    { id: 2, name: "Coin Multiplier", description: "Coins per click x10", price: 40000 },
    { id: 3, name: "Power Tap", description: "Coins per click +2", price: 10000 },
    { id: 4, name: "Golden Touch", description: "Random bonus on click", price: 40000 },
    { id: 5, name: "Coin Stream", description: "passive income x10", price: 40000 },
    { id: 6, name: "Mining Drone", description: "Automated clicks for 1 min", price: 100000 }
];

function generateId() {
    return upgrades.length > 0 ? Math.max(...upgrades.map(u => u.id)) + 1 : 1;
}

function validateUpgrade(upgrade) {
    const errors = [];
    
    if (!upgrade.name || typeof upgrade.name !== 'string') {
        errors.push("Name is required and must be a string");
    }
    if (!upgrade.description || typeof upgrade.description !== 'string') {
        errors.push("Description is required and must be a string");
    }
    if (typeof upgrade.price !== 'number' || upgrade.price < 0) {
        errors.push("Price must be a positive number");
    }
    
    return errors;
}

app.get('/upgrades', (req, res) => {
    res.json(upgrades);
});

app.get('/upgrades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const upgrade = upgrades.find(u => u.id === id);
    
    if (!upgrade) {
        return res.status(404).json({ error: "Upgrade not found" });
    }
    
    res.json(upgrade);
});

app.post('/upgrades', (req, res) => {
    const errors = validateUpgrade(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    const newUpgrade = {
        id: generateId(),
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };
    
    upgrades.push(newUpgrade);
    res.status(201).json(newUpgrade);
});

app.put('/upgrades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = upgrades.findIndex(u => u.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: "Upgrade not found" });
    }
    
    const errors = validateUpgrade(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    const updatedUpgrade = {
        id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };
    
    upgrades[index] = updatedUpgrade;
    res.json(updatedUpgrade);
});

app.delete('/upgrades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = upgrades.findIndex(u => u.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: "Upgrade not found" });
    }
    
    upgrades = upgrades.filter(u => u.id !== id);
    res.status(204).end();
});
app.post('/click', (req, res) => {
    try {
        req.user.balance += req.user.coinsPerClick;
        res.json({
            balance: req.user.balance,
            coinsPerClick: req.user.coinsPerClick,
            passiveIncomePerSecond: req.user.passiveIncomePerSecond
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/passive-income', (req, res) => {
    try {
        req.user.balance += req.user.passiveIncomePerSecond;
        res.json({
            balance: req.user.balance,
            coinsPerClick: req.user.coinsPerClick,
            passiveIncomePerSecond: req.user.passiveIncomePerSecond
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000')
})


