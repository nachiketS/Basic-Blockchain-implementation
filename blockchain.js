const EC = require('elliptic').ec
const ec = new EC('secp256k1');
const SHA256 = require ('crypto-js/sha256');

class Transaction{
    constructor(from,to,amount){
        this.from=from
        this.to=to
        this.amount=amount
    }
    calculateHash(){
        return SHA256(this.from + this.to + this.amount).toString();
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.from){
            throw new Error('You cannot sign transactions for other wallets');
        }

        let hashTx=this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex')
    }
    isValid(){
        if(this.from === null)
            return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature found in this transaction');
            return false;
        }
        const publicKey = ec.keyFromPublic(this.from,'hex');
        //verify if the hash of this block has been signed by this signature
        return publicKey.verify(this.calculateHash(),this.signature)
    }
}
class Block{
    constructor(timestamp,transactions,previousHash=''){
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce=0;
    }
    calculateHash(){
        return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.transactions)+this.nonce).toString();
    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined : "+this.hash);
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid)
                return false;
        }
        return true;
    }
}
class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty=3;
        this.pendingTransactions=[];
        this.miningReward = 100;
    }
    createGenesisBlock(){
        return new Block("01/01/2019","Genesis Block","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }   
    // addBlock(newBlock){
    //     newBlock.previousHash=this.getLatestBlock().hash;
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }
    
    minePendingTransactions(miningRewardAddress){
        this.pendingTransactions.push(new Transaction(null,miningRewardAddress,this.miningReward));
        let block = new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.difficulty)
         
        this.chain.push(block)
    }
    addTransaction(transaction){
        // if(transaction.amount <= this.getBalance(transaction.from)){
        //     this.pendingTransactions.push(transaction)
        // }
        if(!transaction.from || !transaction.to)
            throw Error('Transaction must have from and to address')
        if(!transaction.isValid())
            throw Error('Cannot add invalid transaction')
        //else console.log("Insufficient Funds");
        this.pendingTransactions.push(transaction)
    }
    getBalance(address){
        let balance = 0;
        for(const traversalblock of this.chain){
            for(const traversaltxn of traversalblock.transactions){
                if(traversaltxn.from===address){
                    balance-=traversaltxn.amount
                }
                if(traversaltxn.to === address){
                    balance+= traversaltxn.amount
                }
            }
        }
        return balance;
    }
    isChainValid(){
        for(let i=1;i<this.chain.length;i++){
            const currBlock=this.chain[i];
            const prevBlock = this.chain[i-1];
            if(currBlock.hash !== currBlock.calculateHash()){
                return false;
            }
            if(currBlock.previousHash !== prevBlock.hash){
                return false;
            }
            if(!currBlock.hasValidTransactions)
                return false;
        }
        return true;
    }
}
module.exports.Transaction=Transaction;
module.exports.Blockchain=Blockchain;