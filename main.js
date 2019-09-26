const EC = require('elliptic').ec
const ec = new EC('secp256k1');
const {Blockchain,Transaction}=require('./blockchain');

const myKey=ec.keyFromPrivate('2f27d6df06a0ea9e916b6022950658d67d86b1b83abce27c873d942305b730ba');
const myWalletAddress= myKey.getPublic('hex');

let xcoin = new Blockchain();

const tx1= new Transaction(myWalletAddress,'public key goes here',10);
tx1.signTransaction(myKey);
xcoin.addTransaction(tx1)

console.log('Starting the miner ...')
xcoin.minePendingTransactions(myWalletAddress)
// xcoin.minePendingTransactions(myWalletAddress)

console.log('\n Balance of miner is : '+xcoin.getBalance(myWalletAddress))
