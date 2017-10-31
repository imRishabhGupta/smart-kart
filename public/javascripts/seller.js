var accounts;
var account;
var transactionInstance;
var Transaction;
var abi, bytecode;

function putContract() {

	Transaction.new({from: accounts[0], gas: 3000000, data: bytecode}, function(err, transaction) {
        if (err) {
            console.log("error");
        }
		transactionInstance = transaction;
	});

}

function getBalance(address) {
    window.web3.eth.getBalance(address, function(err, balance){
        console.log(parseFloat(window.web3.fromWei(balance, 'ether')));
    });
}

window.onload = function() {

	if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
    } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

	var self = this;

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

        accounts = accs;
        account = accounts[0];

        $.getJSON('Transaction.json', function(data) {
            abi = data.abi;
            bytecode = data.unlinked_binary;
            Transaction = web3.eth.contract(abi);
            putContract();
        });
    });
};
