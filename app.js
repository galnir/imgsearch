const express = require('express');
const url = require('url');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');
const app = express();
var client = new GoogleImages(CSE_ID, API_KEY);

mongoose.connect("mongodb://localhost/imgsearch");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const whenSchema = new mongoose.Schema({
    term: String,
    when: {type: Date, default: Date.now}
});
const Search = mongoose.model('search', whenSchema);

app.get("/", (req, res) => {
    res.send("home page");
});

app.get("/imagesearch/:search", (req, res) => {
    var searchterm = req.params.search;
    var pageNum = req.query.offset;
    var data = [];
    var whenSearched = new Search({term: searchterm});
    if(typeof pageNum !== "undefined"){
    whenSearched.save(function(err){
        if(err){
            console.log(err);
        }
    })
    client.search(searchterm, {
        page: pageNum
    }).then(images => {
        images.forEach(function (object) {
            data.push({
                url: object.url,
                snippet: object.description,
                thumbnail: object.thumbnail.url,
                context: object.parentPage
            });
        });
        res.json(data);
    });
} else {
    res.send("something went wrong, try to follow the usage examples");
}
});

app.get("/latest/imagesearch", function (req, res) {
    var recent = [];
    Search.find({}, function(err, collection) {
        collection.forEach(function(doc){
            recent.push({
                term: doc.term,
                when: doc.when
            });
        });
        res.json(recent);
    });
});

app.get("*", function (req, res) {
    res.send("hit route that dont exist");
});

app.listen(3000, function () {
    console.log("server is online");
});
