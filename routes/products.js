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
 * POST to addproduct.
 */
router.post('/addproduct', function(req, res) {
    var db = req.db;
    var collection = db.get('customers');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * POST to updatestatus.
 */
router.post('/updatestatus', function(req, res) {
    var db = req.db;
    var ObjectID = req.ObjectID;
    var collection = db.get('customers');
    var query = { _id: new ObjectID(req.body) };  //TODO: parse what you get from body
    var newvalues = { $set: { status: "Refunded" } };
    
    collection.update(query, newvalues, function(err, result) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;
