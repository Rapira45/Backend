const crypto = require('crypto');


function encodePassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}


function generateToken(email) {
    const timestamp = Date.now().toString();
    return crypto.createHash('sha256').update(email + timestamp).digest('hex');
}

module.exports = { encodePassword, generateToken };