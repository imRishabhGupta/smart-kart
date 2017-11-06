var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

var dbName = "customers";

/*
 * GET productlist.
 */
router.get('/productlist', function(req, res) {
    var db = req.db;
    var collection = db.get(dbName);
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET product from id.
 */
router.get('/getproduct/:id', function(req, res) {
    var db = req.db;
    var collection = db.get(dbName);
    var ObjectID = req.ObjectID;
    var query = { _id: new ObjectID(req.params.id) };
    collection.findOne(query, function(e,docs){
        res.json(docs);
    });
});

/*
 * GET product list from seller address.
 */
router.get('/sellerproductlist/:sellerAddress', function(req, res) {
    var db = req.db;
    var collection = db.get(dbName);
    var query = { sellerAddress: req.params.sellerAddress };
    collection.find(query, function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to addproduct.
 */
router.post('/addproduct', function(req, res) {
    var db = req.db;
    var collection = db.get(dbName);
    console.log(req.body);
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { 
                msg: 'Product added successfully.',
                result: true
             } : { msg: err }
        );
    });
});

/*
 * PUT to updatestatus.
 */
router.put('/updatestatus', function(req, res) {
    var db = req.db;
    var ObjectID = req.ObjectID;
    var collection = db.get(dbName);
    var query = { _id: new ObjectID(req.body._id) };
    var newvalues;
    if(req.body.status == "Confirmed")
        newvalues= { $set: { status: req.body.status, buyerAddress: req.body.buyerAddress } };
    else
        newvalues = { $set: { status: req.body.status } };
    collection.update(query, newvalues, function(err, result) {
        res.send(
            (err === null) ? { msg: 'Status of product changed successfully.' } : { msg: err }
        );
    });
});

/*
 * DELETE to delete product.
 */
router.delete('/deleteproduct/:sellerAddress/:id', function(req, res) {
    var db = req.db;
    var collection = db.get(dbName);
    var ObjectID = req.ObjectID;
    var query = { 
        _id: new ObjectID(req.params.id), 
        sellerAddress: req.params.sellerAddress
    };
    collection.remove(query, function(err) {
        res.send((err === null) ? { msg: 'Product deleted successfully.' } : { msg:'error: ' + err });
    });
});

module.exports = router;
