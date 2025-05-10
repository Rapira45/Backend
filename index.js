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
    console.log({email, password})
    if (password.length < 8) {
        return res.status(400).json({message : 'Password length should be minimum 8 symbols!!' })
    }
    if(users.find((user) => user.email === email)) {
       return res.status(400).json({message: 'User with this email already exists!' })
    }
    users.push({
        id:Date.now(),
        email, 
        password : encodePassword(password)
    })
    return res.status(201).json({message: 'Registered successfully!' })
})

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
    
    return res.status(200).json({ message: 'Login successful!',  user: {id: user.id, email: user.email }
    })
})

let upgrades = {
    1: { id: 1, name: "Click Accelerator", description: "speed of earning x10", price: 49000 },
    2: { id: 2, name: "Coin Multiplier", description: "Coins per click x10", price: 49000 },
    3: { id: 3, name: "Power Tap", description: "Coins per click +2", price: 10000 },
    4: { id: 4, name: "Golden Touch", description: "Random bonus on click", price: 48000 },
    5: { id: 5, name: "Coin Stream", description: "passive income x10", price: 49000 },
    6: { id: 6, name: "Mining Drone", description: "Automated clicks for 1 min", price: 100000 }
};

function generateId() {
    const ids = Object.keys(upgrades).map(Number);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
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
    res.json(Object.values(upgrades));
});

app.get('/upgrades/:id', (req, res) => {
    const id = req.params.id;
    const upgrade = upgrades[id];
    
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
    
    const id = generateId();
    upgrades[id] = {
        id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };
    
    res.status(201).json(upgrades[id]);
});

app.put('/upgrades/:id', (req, res) => {
    const id = req.params.id;
    
    if (!upgrades[id]) {
        return res.status(404).json({ error: "Upgrade not found" });
    }
    
    const errors = validateUpgrade(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    upgrades[id] = {
        id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };
    
    res.json(upgrades[id]);
});

app.delete('/upgrades/:id', (req, res) => {
    const id = req.params.id;
    
    if (!upgrades[id]) {
        return res.status(404).json({ error: "Upgrade not found" });
    }
    
    delete upgrades[id];
    res.status(204).end();
});

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000')
})

