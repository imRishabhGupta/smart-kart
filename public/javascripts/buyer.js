var accounts;
var account;
var balance;

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
    account = accounts[2];
    updateBalance();

  });

  populateList();
  
};

function updateBalance() {
    window.web3.eth.getBalance(account, function(err, balance){
        $("#eth-balance").html(parseFloat(window.web3.fromWei(balance, 'ether')));
    });
}

function getBalance(address) {
    window.web3.eth.getBalance(address, function(err, balance){
      balance=parseFloat(window.web3.fromWei(balance, 'ether'));
        console.log(parseFloat(window.web3.fromWei(balance, 'ether')));
    });
}

function populateList() {
  var productList = '';
  var url = '/products/productlist';
  $.getJSON(url, function(data){
    //currentData = data;
    $.each(data, function(){

          productList += '<div class="panel panel-primary">';
            productList += '<div class="panel-heading">';
              productList += '<h3 class="panel-title"><strong>'+this.name+'</strong></h3>';
            productList += '</div>';

            productList += '<div class="panel-body">';
              productList += '<span class="item">';
                productList += '<span class="item-img">';
                productList += '<img src="'+this.image+'">';
                productList += '</span>';
          
                productList += '<span class="seller-address">';
                productList += '<p><strong>Seller Address: </strong>'+this.sellerAddress+'</p>';
                productList += '</span>';
          
                productList += '<span class="contract-address">';
                productList += '<p><strong>Contract Address: </strong>'+this.contractAddress+'</p>';
                productList += '</span>';
      
                productList += '<span class="item-description">';
                productList += '<p><strong>Description:</strong>'+this.description+'</p>';
                productList += '<p><strong>Price:</strong>'+this.price+'</p>';
                productList += '</span>';

                productList += '<span>';

                var buttonString;
                if(this.status == 'Confirmed'){
                  productList += '<button type="button" class="btn btn-success btn-lg" rel="'+this._id+'"';
                  buttonString = 'Keep Item';
                }
                else if(this.status == 'Created'){
                  productList += '<button type="button" class="btn btn-default btn-lg" rel="'+this._id+'"';
                  buttonString = 'Buy Now';
                }
                else if(this.status == 'Disabled'){
                  productList += '<button type="button" class="btn btn-default btn-lg" rel="'+this._id+'"';
                  buttonString = 'Sold Out';
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

                if(this.status == 'Confirmed'){ // Refund option button // TO DO: Change to Confirmed
                  productList += '<span>';
                  productList += '<button type="button" class="btn btn-danger btn-lg" rel="'+this._id+'"';
                  buttonString = 'Return Item';
                
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
  $('#productList').on('click', "div button.btn.btn-default", confirmPurchase);
  $('#productList').on('click', "div button.btn.btn-danger", refundItem);
  $('#productList').on('click', "div button.btn.btn-success", confirmReceipt);

  if(account){
    updateBalance();
  }
}

function confirmPurchase(event) {

  var button = this;

  var productData;
  var contractInstance;
  var cAddress;
  var price;
  var URL = '/products/getproduct/'+$(this).attr('rel');
  var bAddress = accounts[2];
  
  $.getJSON(URL, function(data){
    productData = data;
    cAddress = data.contractAddress;
    price = data.price;

    var abi, bytecode, Transaction;
    $.getJSON('Transaction.json', function(data) {
      abi = data.abi;
      Transaction = web3.eth.contract(abi);
      contractInstance  = Transaction.at(cAddress);

      window.web3.eth.getBalance(bAddress, function(err, balance){
        balance=parseFloat(window.web3.fromWei(balance, 'ether'));
        balance = balance*(1e18);
        
        if(balance >= 2*price){
          contractInstance.confirmPurchase({from: bAddress, value:2*price}, function(){
            URL = '/products/updatestatus';

            var dataObject = {_id:$(button).attr('rel'), status:'Confirmed', buyerAdress: bAddress}; //TO DO: Change to Confirmed
            $.ajax({
              url: URL,
              type: 'PUT',
              data: JSON.stringify(dataObject),
              contentType: 'application/json',
              success: function(result) {
                alert("Product bought successfully.");
                populateList();
              }
            });
            alert("Purchase Confirmed");
          });
        }
        else{
          alert("You don't have enough balance!");
          return;
        }
      });
    });
  });
  
}

function confirmReceipt(event) {
  var button = this;
  var bAddress = accounts[2];
  var cAddress, contractInstance;
  var URL = '/products/getproduct/'+$(button).attr('rel');
  $.getJSON(URL, function(data){
    cAddress = data.contractAddress;
    var abi, bytecode, Transaction;
    $.getJSON('Transaction.json', function(data) {
      abi = data.abi;
      Transaction = web3.eth.contract(abi);
      contractInstance  = Transaction.at(cAddress);
      contractInstance.confirmReceived({from: bAddress}, function(){
        URL = '/products/updatestatus';
        var dataObject = {_id:$(button).attr('rel'), status:'Disabled'};
        $.ajax({
          url: URL,
          type: 'PUT',
          data: JSON.stringify(dataObject),
          contentType: 'application/json',
          success: function(result) {
            alert("Product's receipt is confirmed.");
            populateList();
          }
        });
      });
    });
  });
}

function refundItem(event) {

  var button = this;
  var bAddress = accounts[2];
  var cAddress, contractInstance;
  var URL = '/products/getproduct/'+$(button).attr('rel');

  $.getJSON(URL, function(data){
    cAddress = data.contractAddress;
    var abi, bytecode, Transaction;
    $.getJSON('Transaction.json', function(data) {
      abi = data.abi;
      Transaction = web3.eth.contract(abi);
      contractInstance  = Transaction.at(cAddress);
      contractInstance.refundBuyer({from: bAddress}, function(data){
        URL = '/products/updatestatus';
        var dataObject = {_id:$(button).attr('rel'), status:'Disabled'};
        $.ajax({
          url: URL,
          type: 'PUT',
          data: JSON.stringify(dataObject),
          contentType: 'application/json',
          success: function(result) {
            alert("Request to return product is sent.");
            populateList();
          }
        });
      });
    });
  });
}