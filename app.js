const express= require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app= express();
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));
// var items=["Buy Food"];
// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true });
mongoose.connect("mongodb+srv://shivani:shivani123@cluster0.1tgcw.gcp.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true });

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name: "Welcome to your Todo-List"
});
const item2=new Item({
  name: "Hit + to add a new item"
});
const item3=new Item({
  name: "<-- Hit this to delete any item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
name: String,
items: [itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
// var today=new Date();
//
// var options={
//   weekday:"long",
//   day:"numeric",
//   month:"long"
// };
// var day=today.toLocaleDateString("en-US",options);

// var day="";
// var currday=today.getDay();
// switch(currday)
// {
//   case 0:
//   day="Sunday";
//   break;
//   case 1:
//   day="Monday";
//   break;
//   case 2:
//   day="Tuesday";
//   break;
//   case 3:
//   day="Wednesday";
//   break;
//   case 4:
//   day="Thursday";
//   break;
//   case 5:
//   day="Friday";
//   break;
//   case 6:
//   day="Saturday";
//   break;
//   default:
//   console.log("Error ");
// }
// if(today.getDay()==='6' || today.getDay()==='0')
// {
//   day="weekend";
//
//   // res.send("Yay its the weekend");
// }
// else{
//   day="weekday";
//
//   // res.sendFile(__dirname + "/index.html");
// }
//
//
  // res.render("lists",{kindOfDay:day,newListItems:items});
  Item.find({},function(err,founditems){
if(founditems.length===0){
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully Inserted");
    }
  });
  res.redirect("/");
}
else{
  res.render("Lists",{listTitle:"Today",newListItems:founditems});
}

  });

  });
app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){
if(!err){
  if(!foundList){
    // console.log("Doesn't exist");
    const list=new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+ customListName);
  }else{
    // console.log("Exists");
    res.render("lists",{listTitle:foundList.name, newListItems:foundList.items});
  }
}
});
const list=new List({
name:customListName,
items:defaultItems
});
list.save();
});

app.post("/",function(req,res){
  var itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    // items.push(item);
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(listName==="Today"){
if(!err){
  console.log("Successfully Deleted");
  res.redirect("/");
}
else{
  console.log(err);
}}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
  });
});
let port = process.env.PORT;
if(port== null || port==""){
  port=3000;
}
// app.listen(port);
app.listen(port,function(){
  console.log("Server is running");
});
