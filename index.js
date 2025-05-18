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
    { id: "click-accelerator", name: "Click Accelerator", description: "Speed of earning x10", price: 40000, type: "multiplyClick", value: 10 },
    { id: "coin-multiplier", name: "Coin Multiplier", description: "Coins per click x10", price: 40000, type: "multiplyClick", value: 10 },
    { id: "power-tap", name: "Power Tap", description: "Coins per click +2", price: 100, type: "addClick", value: 2 },
    { id: "golden-touch", name: "Golden Touch", description: "Random bonus on click", price: 40000, type: "multiplyClick", value: 5},
    { id: "coin-stream", name: "Coin Stream", description: "passive income x10", price: 40000, type: "multiplyPassive", value: 10 },
    { id: "mining-drone", name: "Mining Drone", description: "Automated clicks for 1 min", price: 100000, type: "addPassive", value: 50 }
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
        price: req.body.price,
        value: req.body.value
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

app.use((req, res, next) => {
    const userId = req.headers['user-id'];
    
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized!" });
    }
    
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
        return res.status(404).json({ error: "User not found!" });
    }
    
    req.user = user;
    next();
});

app.post('/click', (req, res) => {
    try {
        req.user.balance += req.user.coinsPerClick;
        res.json({ balance: req.user.balance });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/passive-income', (req, res) => {
    try {
        req.user.balance += req.user.passiveIncomePerSecond;
        res.json({ balance: req.user.balance });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/buy-upgrade', (req, res) => {
     try {
        const userId = Number(req.body.userId);
        const upgradeId = req.body.upgradeId;

        const user = users.find(u => u.id === userId);
        const upgrade = upgrades.find(u => u.id === upgradeId);

        if (!upgrade || !user) {
            return res.status(404).json({ error: "Not found" });
        }
        
        if (user.purchasedUpgrades?.includes(upgradeId)) {
            return res.status(400).json({ error: "Upgrade already purchased" });
        }
        
        if (user.balance < upgrade.price) {
            return res.status(400).json({ error: "Not enough money" });
        }
        
        user.balance -= upgrade.price;
        switch (upgrade.type) {
            case 'multiplyClick':
                user.coinsPerClick *= upgrade.value;
                break;
            case 'addClick':
                user.coinsPerClick += upgrade.value;
                break;
            case 'multiplyPassive':
                user.passiveIncomePerSecond *= upgrade.value;
                break;
            case 'addPassive':
                user.passiveIncomePerSecond += upgrade.value;
                break;
            default:
                return res.status(400).json({ error: "Invalid type effect" });
        }
        
        user.purchasedUpgrades = user.purchasedUpgrades || [];
        user.purchasedUpgrades.push(upgradeId);
        
        res.json({
            balance: user.balance,
            coinsPerClick: user.coinsPerClick,
            purchasedUpgrades: user.purchasedUpgrades
        });
        
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000')
})


