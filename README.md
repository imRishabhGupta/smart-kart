# SmartKart
>**SmartKart is a P2P marketplace with no trusted 3rd parties involved in between the transaction.**

With the help of the Ethereum blockchain, a smart contract between the buyer and seller is signed by both the parties to establish a two party trustless escrow. 
The seller puts up 1x price of item as a deposit and the buyer puts up 2x of the price. These can only be released when both agree on payment or refund. 
This puts them in the Nash equilibrium; neither of them will be interested in cheating since the value to gain is noticeably lower than the value to lose. Therefore they both find a way to complete or cancel contract to mutual satisfaction in order to get back their locked funds. 
The scheme hence removes the need for reputation or trusted 3rd parties and enables fully private and autonomous operation for humans and machines.
## Dependencies

* ethereumjs-testrpc 
* web3
* solc
* mongodb

Install missing dependencies with [npm](https://www.npmjs.com/). 

## Install
Start test network, using the ```testrpc``` command.

Use ```npm install``` command to download missing packages.

To start the server, run command ```npm start```, which will start the server on localhost:3000. There are two pages with following urls - 
 
* localhost:3000/seller
* localhost:3000/buyer

## Usage

Run the following commands to open the node console then deploy your contract to the test chain

```
canoodle:~/smart-cart$ testrpc
canoodle:~/smart-cart$ node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
> code = fs.readFileSync('transaction.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':transaction'].interface)
> transactionContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':transaction'].bytecode
> deployedContract = transactionContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = transactionContract.at(deployedContract.address)
```
