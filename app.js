//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();

//convention to use underscore for lodash
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//if it doesnt exist will make it
////////////////////////////////HAS PASSWORD IN SO DONT PUT ON GIT /////////////
mongoose.connect("mongodb+srv://phy5prtAdmin:B00pBeep!@cluster0-su305.mongodb.net/todolistDB", {useNewUrlParser: true});

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const Schema = mongoose.Schema;
const itemsSchema = new Schema({
  name: String,
});
//capitalise mongoose models
//singular non plural version for model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
name: "Hit the + button to add a new item."

});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

//put in array so can insert many
const defaultItems=[item1, item2, item3];

const listSchema = {
name: String,
items: [itemsSchema]

};

const List = mongoose.model("List", listSchema);


//replacing with mongoose because the arrays only hold the data while nodemon is running
//data not kept on restart
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

//got rid of date to lower complexity

//replace items array with the collection

  Item.find({},function(err, foundItems){
if(err){console.log(err);
}else if(foundItems.length===0){

  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }  else{console.log("inserted defaults");
  }
  });

  // res.render("list", {listTitle: "Today", newListItems: foundItems});
  res.redirect("/");
}else{

    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});



});

app.post("/", function(req, res){

//here turning what they made into a js
  const itemName = req.body.newItem;
  //button name is list
  const listName = req.body.list;

  const item = new Item({ name: itemName });
  if(listName === "Today")
  {
  item.save();
res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
});
}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId,  function(err){
    if(!err){
    console.log("removed item "+checkedItemId);
  res.redirect("/");
  }
  });

}else{
  //                            conditions   updates      removew from array items
  List.findOneAndUpdate({name:listName} ,{$pull:{items:{_id: checkedItemId}}},
      function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }

  });
}


});

//making dynamic route instead

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/:customListName", function(req,res){
  //lodash to standardise so dont end up with 2 list for work and Work
  const customListName = _.capitalize(req.params.customListName);
List.findOne({name: customListName}, function(err, foundList ){
if(!err){
  if(!foundList){
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/" +customListName);
  }else
  //this is the list ejs
{
  res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
}}});

  });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){ port=3000;}

app.listen(port, function() {
// app.listen(3000, function() {
  console.log("Server started successfully.");
});
