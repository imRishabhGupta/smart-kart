var accounts;
var account;
var transactionInstance;
var abi, bytecode;
var Transaction, contractAddress;


function getBalance(address) {
    window.web3.eth.getBalance(address, function(err, balance){
        console.log(parseFloat(window.web3.fromWei(balance, 'ether')));
    });
}

window.onload = function() {

  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
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
        async: false,
        abi = data.abi;
        bytecode = data.unlinked_binary;
        Transaction = web3.eth.contract(abi);
        Transaction.new({from: accounts[0], gas: 3000000, data: bytecode}, function(err, transaction) {
          if(err){
            console.log("error");
            return;
          }
          contractAddress = transaction.address;
        });
        populateList();
    });
  });
};

function populateList() {
    var productList = '';
    var url = '/products/sellerproductlist/'+account;
    $.getJSON(url, function(data){
        currentData = data;
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
                productList += '<button type="button" class="btn btn-info btn-lg" rel="'+this._id+'"';
                buttonString = 'Product bought';
                productList += ' disabled';
            }
            else if(this.status == 'Created'){
                productList += '<button type="button" class="btn btn-default btn-lg" rel="'+this._id+'"';
                buttonString = 'Product on Sale';
                productList += ' disabled';
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
    $('#productForm').submit(submitProduct);

}

function deleteItem(event) {
    var id = $(this).attr('rel');
    var sellerAddress = account;//TO DO: Replace it with actual seller address accounts[0]
    var URL = '/products/deleteproduct/' + sellerAddress + '/' + id;
    $.ajax({
        async: false,
        url: URL,
        type: 'DELETE',
        success: function(result) {
            console.log(result);
            alert("Product is deleted successfully.");
           populateList();
        }
    });
}

function submitProduct(event) {
    var URL = "/products/addproduct"
    var dataObject = {
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: document.getElementById("productPrice").value,
        image: document.getElementById("productImage").value,
        status: "Created",
        sellerAddress: accounts[0],//TO DO: Replace it with actual seller address accounts[0]
        contractAddress: contractAddress//TO DO: Replace it with actual contract address after deploying contract
    }
    $.ajax({
        url: URL,
        type: 'POST',
        data: JSON.stringify(dataObject),
        contentType: 'application/json',
        success: function(result) {
            alert("Product has been added successfully.");
            populateList();
        }
    });

    //return false;
}
