//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aditya:@Aditya369@cluster0.mbpmj.mongodb.net/todolidtDB?retryWrites=true&w=majority",{useNewUrlParser:true});
const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const Item1=new Item({
  name:"welcome to to do list"
});
const Item2=new Item({
  name:"hit + to add new items"
});
const Item3=new Item({
  name:"<-- hit to delete items"
});

const defaultArray=[Item1,Item2,Item3]

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultArray,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully updated to data base");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultArray
          })
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
    })

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  const postItem=new Item({
    name:itemName
  });
  if(listName==="Today"){
    postItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(postItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete", function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully removed from data base");
      }
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
