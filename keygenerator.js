//elliptic is a library that allows us to generate public and private keys pair and also has functions to sign and verify stuff

const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log()
console.log("Public key : "+publicKey)
console.log()
console.log("Private Key : "+privateKey)