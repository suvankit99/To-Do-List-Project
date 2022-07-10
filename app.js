//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose')
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDoListDB")

const itemSchema = new mongoose.Schema({
  name: String
})

const Item  = new mongoose.model("Item" , itemSchema)

const item1 = new Item({
  name:"Welcome to your very own ToDo list !"
})

const item2 = new Item({
  name:"Hit the + to add a new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete an item"
})

const defaultItems = [item1 , item2 , item3]

const listSchema = mongoose.Schema({
  name:String ,
  items: [itemSchema]
})

const List = mongoose.model("List" , listSchema )


app.get("/", function(req, res) {
  Item.find({} , (err, foundItems) =>{
    if(err){
      console.log(err)
    }
    else{
      if(foundItems.length === 0){
        Item.insertMany( defaultItems , (err) => {
            if(err){
              console.log(err)
            }
            else{
              console.log("successfully added items to database")
            }
        })
        res.redirect("/");
      }
      else{
        res.render("list" , {newListItems:foundItems , listTitle:"Today"})
      }
    }
  })
  
});

app.post("/", function(req, res){

  const newitemName = req.body.newItem;
  const listName = req.body.list;
  const addedItem = new Item({
    name: newitemName
  })

  if(listName === "Today"){
    addedItem.save();
    res.redirect("/");

  }
  else{
    List.findOne({name:listName} , (err,foundList)=> {
      if(!err){
        foundList.items.push(addedItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }
  

});



app.post("/delete" , (req,res)=>{
  const checkedId = req.body.checkbox;
  const listName = req.body.listName ;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedId , (err)=> console.log(err));
    res.redirect("/");

  }
  else{
    List.findOneAndUpdate({name:listName} , {$pull:{items:{_id:checkedId}}} , (err ,foundList)=>{
      if(!err){
        res.redirect("/" + listName)
      }
    });
  }
  
})
 
app.get("/:ListName" , (req,res) => {
  const customListName = _.capitalize(req.params.ListName);
  List.findOne({name:customListName} , (err , foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items : defaultItems
        })
        console.log(customListName);
        res.redirect("/" + customListName);
        list.save();
      }
      else{
        res.render("list" , {newListItems:foundList.items , listTitle:foundList.name})

      }
    }
    else{
      console.log(err)
    }

  })
  
})


  
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
