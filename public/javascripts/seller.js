var accounts;
var account;
var transactionInstance;
var Transaction;
var abi, bytecode;

function submitProduct(event) {
    var price = document.getElementById("productPrice").value;
    price = price*(1e18);
    console.log(price);
	Transaction.new({from: accounts[0], gas: 3000000, data: bytecode, value: price}, function(err, transaction) {
        if (err) {
            console.log(err);
        }
		transactionInstance = transaction;
        if(transaction !== undefined || transactionInstance.address !== undefined) {

            console.log(transactionInstance.address);
            console.log(accounts[0]);
            var URL = "/products/addproduct";
            var dataObject = {
                name: document.getElementById("productName").value,
                description: document.getElementById("productDescription").value,
                price: price,
                image: document.getElementById("productImage").value,
                status: "Created",
                sellerAddress: accounts[0],
                contractAddress: transactionInstance.address,
                date: new Date(),
            }
            $.ajax({
                url: URL,
                type: 'POST',
                data: JSON.stringify(dataObject),
                contentType: 'application/json',
                success: function(result) {
                    alert("Product has been added successfully.");
                    document.getElementById("productForm").reset();
                    populateList();
                    getBalance(transactionInstance.address);
                }
            });
        }
	});
    return false;
}

function getBalance(address) {
    window.web3.eth.getBalance(address, function(err, balance){
        console.log(parseFloat(window.web3.fromWei(balance, 'ether')));
    });
}

function updateBalance() {
    window.web3.eth.getBalance(account, function(err, balance){
        $("#eth-balance").html(parseFloat(window.web3.fromWei(balance, 'ether')));
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
        updateBalance();

        $.getJSON('Transaction.json', function(data) {
            abi = data.abi;
            bytecode = data.unlinked_binary;
            Transaction = web3.eth.contract(abi);
        });
        //console.log(Transaction);
        populateList();
    });
};

function populateList() {
    var productList = '';
    var url = '/products/sellerproductlist/' + account;
    $.getJSON(url, function(data){
        currentData = data;

        if(currentData.length === 0){
            productList = '<div class="eth container">Sorry, you don\'t have any products deployed. Go ahead deploy your first product!</div>';
        }

        $.each(data, function(){

            productList += '<div class="panel panel-primary">';
            productList += '<div class="panel-heading">';
            productList += '<h3 class="panel-title"><strong> '+this.name+'</strong></h3>';
            productList += '</div>';

            productList += '<div class="panel-body">';
            productList += '<span class="item">';
            productList += '<span class="item-img">';
            productList += '<img src="'+this.image+'">';
            productList += '</span>';

            productList += '<span class="seller-address">';
            productList += '<p><strong>Seller Address: </strong> '+this.sellerAddress+'</p>';
            productList += '</span>';

            var one_day=1000*60*60*24;
            var deployDate = new Date(this.date);
            var currentDate = new Date();
            var difference_ms = currentDate.getTime() - deployDate.getTime();
            var days = Math.round(difference_ms/one_day); 
            days = 15 - days;
            console.log(days);
            productList += '<span class="auto-kill">';
            productList += '<p><strong>The contract can be killed after </strong>'+days+' days</p>';
            productList += '</span>';
          
            productList += '<span class="contract-address">';
            productList += '<p><strong>Contract Address: </strong> '+this.contractAddress+'</p>';
            productList += '</span>';
      
            productList += '<span class="item-description">';
            productList += '<p><strong>Description:</strong> '+this.description+'</p>';
            productList += '<p><strong>Price:</strong> '+(this.price)/(1e18)+'</p>';
            productList += '</span>';

            productList += '<span>';

            var buttonString;
            console.log(this.status);
            if(this.status == 'Confirmed'){
                productList += '<button type="button" class="btn btn-info btn-lg" rel="'+this._id+'"';
                buttonString = 'Product bought';
                productList += ' disabled';
            }
            else if(this.status == 'Created'){
                productList += '<button type="button" class="btn btn-default btn-lg" rel="'+this._id+'"';
                buttonString = 'Product on Sale';
                productList += ' disabled';
            }
            else if(this.status == 'Refund'){
                productList += '<button type="button" class="btn btn-primary btn-lg" rel="'+this._id+'"';
                buttonString = 'Refund User';
            }
            else if(this.status == 'Disabled'){
                productList += '<button type="button" class="btn btn-success btn-lg" rel="'+this._id+'"';
                buttonString = 'Product Delivered';
                productList += ' disabled';
            }
            else{
                productList += '<button type="button" class="btn btn-default btn-lg" rel="'+this._id+'"';
                productList += ' disabled';
                buttonString = 'NA';
            }
            productList += '>' + buttonString;
            productList += '</button>';
            productList += '</span>';

            if(this.status == 'Created'){
                productList += '<span>';
                productList += '<button type="button" class="btn btn-danger btn-lg" rel="'+this._id+'"';
                buttonString = 'Delete item';
                
                productList += '>' + buttonString;
                productList += '</button>';
                productList += '</span>';
            }

            productList += '</span>';
        
            productList += '</div>';
            productList += '</div>';

        });
        $('#productList').html(productList);
    });
    $('#productList').on('click', "div button.btn.btn-danger", deleteItem);
    $('#productList').on('click', "div button.btn.btn-primary", refundItem);
    $('#productForm').submit(submitProduct);
    if(account){
        updateBalance();
    }
}

function deleteItem(event) {
    var id = $(this).attr('rel');
    var sellerAddress = accounts[0];
    var URL = '/products/deleteproduct/' + sellerAddress + '/' + id;
    $.ajax({
        url: URL,
        type: 'DELETE',
        success: function(result) {
            console.log(result);
            alert("Product is deleted successfully.");
            populateList();
        }
    });
}

function refundItem(event) {
  var button = this;
  var sAddress = accounts[0];
  var cAddress, contractInstance;
  var URL = '/products/getproduct/'+$(button).attr('rel');

    $.getJSON(URL, function(data){
        cAddress = data.contractAddress;
        var abi, bytecode, Transaction;
        $.getJSON('Transaction.json', function(data) {
          abi = data.abi;
          Transaction = web3.eth.contract(abi);
          contractInstance  = Transaction.at(cAddress);
          contractInstance.refundBuyer({from: sAddress}, function(data){
            URL = '/products/updatestatus';
            var dataObject = {_id:$(button).attr('rel'), status:'Disabled'};
            $.ajax({
              url: URL,
              type: 'PUT',
              data: JSON.stringify(dataObject),
              contentType: 'application/json',
              success: function(result) {
                alert("Product Returned.");
                populateList();
              }
            });
          });
        });
    });
}