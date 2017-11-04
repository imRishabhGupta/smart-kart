var accounts;
var account;
var currentData;


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

    });

  

  var productList = '';
  var url = 'http://localhost:3000/products/productlist';
  $.getJSON(url, function(data){
    currentData = data;
    $.each(data, function(){

          //productList += '<li id="sda">';
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
          productList += '<button type="button" class="btn btn-default btn-lg" id="'+this._id+'">';
          if(this.status == 'confirmed')
            productList += 'Click here if you have received the item';
          else if(this.status == 'Created'){
            productList += 'Buy Now';
          }
          else if(this.status == 'Disabled'){
            productList += 'Sold Out';
          }
          else{
            alert("There is an error rishab's code");
          }
          productList += '</button>';
          productList += '</span>';
          productList += '</span>';
        
          productList += '</div>';
          productList += '</div>';
          //productlist += '</li>';
    });
    $('#productList').html(productList);   
  });
  
};