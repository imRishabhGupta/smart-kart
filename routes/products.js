var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

/*
 * GET productlist.
 */
router.get('/productlist', function(req, res) {
    var db = req.db;
    var collection = db.get('customers');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET product from id.
 */
router.get('/getproduct/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('customers');
    var ObjectID = req.ObjectID;
    var query = { _id: new ObjectID(req.params.id) };
    collection.find(query, function(e,docs){
        res.json(docs);
    });
});

/*
 * POST to addproduct.
 */
router.post('/addproduct', function(req, res) {
    var db = req.db;
    var collection = db.get('customers');
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
    var collection = db.get('customers');
    var query = { _id: new ObjectID(req.body._id) };
    var newvalues = { $set: { status: req.body.status } };
    collection.update(query, newvalues, function(err, result) {
        res.send(
            (err === null) ? { msg: 'Status of product changed successfully.' } : { msg: err }
        );
    });
});

module.exports = router;
