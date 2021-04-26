const{Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('d3195086ce83b356d086ab22825e70b8fd18ee37fbccadd4f16fa50d48c7212d');
const myWalletAddress = myKey.getPublic('hex');

let clubcoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key here',10);
tx1.signTransaction(myKey);
clubcoin.addTransaction(tx1);

console.log('\n Starting the miner: ');
clubcoin.minePendingTrans(myWalletAddress);
console.log('Varuns Balance : ', clubcoin.getBalance(myWalletAddress));

console.log('\n Starting the miner: ');
clubcoin.minePendingTrans(myWalletAddress);
console.log('Varuns Balance : ', clubcoin.getBalance(myWalletAddress));
