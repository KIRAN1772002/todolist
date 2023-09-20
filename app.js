const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://kirankumart143225:KY0LVWLNgzDCUA33@cluster0.gjel1af.mongodb.net/todolistDB");
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item",itemSchema);
const item1 = new Item ({
  name:"Welcome to your todolist"
});
const item2 = new Item ({
  name:"Hit the + button to add a new item"
});
const item3 = new Item ({
  name:"Hit this to delete on item"
});
const defaultItem = [item1,item2,item3];
//Item.insertMany(defaultItem);
const listSchema = {
  name:String,
  items:[itemSchema]
};
const List = mongoose.model("List",listSchema);
app.get("/", async function(req, res) {
const day = date.getDate();
  const itemList=  await Item.find({}).select('');
  if (itemList.length===0){
    Item.insertMany(defaultItem);
    res.redirect("/");
  }else{
    res.render("list", {listTitle: day, newListItems: itemList});
  }
});
app.get ("/:customListName",async (req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  await List.findOne({name:customListName}).then((data)=>{
    if (!data){
      const list = new List({
        name : customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/"+customListName)
    }else{
      res.render("list", {listTitle: customListName, newListItems: data.items});
    }
  });
});
app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();
  const item = new Item({
    name:itemName
  });
  if (listName===day) {
    item.save();
    res.redirect("/");
  }else{
    await List.findOne({name:listName}).then((data)=>{
    data.items.push(item);
    data.save();
    res.redirect("/"+listName);
    });
  };
});
app.post("/delete",async (req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();
  if (listName===day) {
    await Item.findByIdAndRemove(checkedItemId).then((err)=>{
      res.redirect("/");
    });
  }else{
    await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((err)=>{
    res.redirect("/"+listName);
    })
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
