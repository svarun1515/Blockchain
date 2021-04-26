const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
  constructor(from, to, amount){
    this.from=from;
    this.to=to;
    this.amount=amount;
  }

  calculateHash(){
    return SHA256(this.from + this.to + this.amount).toString();
  }

  signTransaction(signingKey)
  {
     if(signingKey.getPublic('hex') !== this.from){
       console.error('You cannot sign transactions for other wallets!');
     }
    const hashTx=this.calculateHash();
    const sig = signingKey.sign(hashTx,'base64');
    this.signature = sig.toDER('hex');
  }

  isValid(){
    if(this.from === null) return true;

    if(!this.signature || this.signature.length === 0){
      console.error('No signature in this Transcaction!');
    }

    const publicKey = ec.keyFromPublic(this.from,'hex');
    return publicKey.verify(this.calculateHash(),this.signature);
  }
}

class Block{
  constructor(timestamp, data, previousHash = ''){
    this.timestamp=timestamp;
    this.data=data;
    this.previousHash=previousHash;
    this.hash=this.calculateHash();
    this.nonce = 0;
  }
  calculateHash(){
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)+this.nonce).toString();
  }

  mineBlock(diff){
    while(this.hash.substring(0,diff) !== Array(diff+1).join("0")){
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block Mined: " + this.hash);
  }

  hasValidTrans(){
    for(const tx of this.data){
      if(!tx.isValid())
      {
        return false;
      }
    }
    return true;
  }
}


class Blockchain
{
  constructor(){
    this.chain = [this.createGenisisBlock()];
    this.diff=2;
    this.pendingtransactions=[];
    this.miningreward=100;
  }

  createGenisisBlock()
  {
    return new Block("01/01/2021", "Genisis", "0");
  }

  getLatestBlock(){
    return this.chain[this.chain.length - 1];
  }

  minePendingTrans(miningrewardAddress){
    let block = new Block(Date.now(), this.pendingtransactions);
    block.mineBlock(this.diff);
    console.log('Block successfully mined ');
    this.chain.push(block);
    this.pendingtransactions=[
      new Transaction(null, miningrewardAddress, this.miningreward)
    ];
  }

  addTransaction(transaction){
    if(!transaction.from || !transaction.to){
      console.error('Transaction must include from and to address.');;
    }

    if(!transaction.isValid()){
      console.error('Cannot add invalid transaction to chain.');
    }

    this.pendingtransactions.push(transaction);
  }

  getBalance(address)
  {
    let balance = 0;
    for(const block of this.chain)
    {
      for(const trans of block.data){
        if(trans.from == address)
        {
          balance-=trans.amount;
        }
        if(trans.to == address)
        {
          balance+=trans.amount;
        }
      }
    }
    return balance;
  }

  Chainverify(){
    for(let i = 1; i < this.chain.length; i++)
    {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i-1];

      if(!currentBlock.hasValidTrans()){
        return false;
      }

      if(currentBlock.hash !== currentBlock.calculateHash())
      {
        return false;
      }
      if(currentBlock.previousHash !== previousBlock.calculateHash())
      {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;
