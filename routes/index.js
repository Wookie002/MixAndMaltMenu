var express = require('express');
var router = express.Router();
var connection = require('../config/db');

/* import json data*/
router.get('/import', isLoggedIn, function(req, res, next) {
  var root = require("../json/cocktail_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "cocktail";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

/* import json data*/
router.get('/import1', isLoggedIn, function(req, res, next) {
  var root = require("../json/malt_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "malt";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

router.get('/import2', isLoggedIn, function(req, res, next) {
  var root = require("../json/bottle_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "bottle";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

router.get('/import3', isLoggedIn, function(req, res, next) {
  var root = require("../json/wine_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "wine";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

router.get('/import4', isLoggedIn, function(req, res, next) {
  var root = require("../json/beer_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "beer";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

router.get('/import5', isLoggedIn, function(req, res, next) {
  var root = require("../json/food_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "food";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})

router.get('/import6', isLoggedIn, function(req, res, next) {
  var root = require("../json/daytime_v3.json");

  for (var i=0; i < root.Data.length; i++) {
    var menu = root.Data[i];

    menu.Num = i+1;
    menu.MainCategoryCode = "daytime";

    connection.query('INSERT INTO menu SET ?', menu, function(err,res){
      if(err) throw err;
    });
  }
  res.json(root);
})
/* GET index page. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.redirect('/index');
});

/* GET index page. */
router.get('/index', isLoggedIn, function(req, res, next) {
  res.render('index');
});

/* GET wating page. */
router.get('/waiting', isLoggedInForWaiting, function(req, res, next) {
  res.render('waiting');
});

/* get web view data*/
router.get('/getMenuListView', function(req, res, next) {
  var mainCategoryCode = req.query.mainCategoryCode;
  var query = connection.query('select * from category where Code = ?',[mainCategoryCode],function(err,rows){
    var menu = rows[0];
    var query = connection.query('select * from menu where MainCategoryCode = ? order by Num ASC',[mainCategoryCode],function(err,rows){
      menu.Data = rows;
      res.json(menu);
    })
  });
});

/* get ipad menu data*/
router.get('/getMenuList', isLoggedIn, function(req, res, next) {
  var mainCategoryCode = req.query.mainCategoryCode;
  var query = connection.query('select * from category where Code = ?',[mainCategoryCode],function(err,rows){
    var menu = rows[0];
    var query = connection.query('select * from menu where MainCategoryCode = ? order by Num ASC',[mainCategoryCode],function(err,rows){
      menu.Data = rows;
      res.json(menu);
    })
  });
});

/* save the order */
router.post('/saveMenu', isLoggedIn, function(req, res, next) {
  var menu = req.body;
  for (var k=0; k < menu.Data.length; k++) {

    for( key in menu.Data[k]) {
      if (menu.Data[k][key] == "null") {
        menu.Data[k][key] = null;
      }
    }

    menu.Data[k].Num = k+1;
    menu.Data[k].MultiLine = menu.Data[k].MultiLine != null ?parseInt(menu.Data[k].MultiLine):null;
    menu.Data[k].option = menu.Data[k].option != null ?parseInt(menu.Data[k].option):null;
    menu.Data[k].priceA = menu.Data[k].priceA != null ?parseInt(menu.Data[k].priceA):null;
    menu.Data[k].priceB = menu.Data[k].priceB != null ?parseInt(menu.Data[k].priceB):null;
    menu.Data[k].type = menu.Data[k].type != null ?parseInt(menu.Data[k].type):null;
  }

  connection.query('DELETE FROM menu WHERE MainCategoryCode = ?', menu.Code, function(err, result){
    if(err) throw err;

    if(menu.Data.length == 0) {
      return res.json({"result": "success"});
    }

    var fields = "";
    var fieldArr = ["MainCategory"
    , "MainCategoryCode"
    , "SubCategoryA"
    , "SubCategoryB"
    , "SubMessage"
    , "Num"
    , "MultiLine"
    , "Name_eng"
    , "Name_kor"
    , "line1_eng"
    , "line2_eng"
    , "line1_kor"
    , "line2_kor"
    , "option"
    , "optionA"
    , "priceA"
    , "imageA"
    , "optionB"
    , "priceB"
    , "imageB"
    , "thumbnail"
    , "type"
    , "MainImage1"
    , "MainImage2"
    , "MainImage3"
    , "BackgroundImage"
    , "text_eng"
    , "text_kor"
    , "isAdd"];

    for (var i=0; i < fieldArr.length; i++) {
      if (!fields) {
        fields += fieldArr[i];
      } else {
        if (fieldArr[i] == "option") {
          fields += ", `option`";
        } else {
          fields += ", " + fieldArr[i];
        }
      }
    }

    var values = [];
    for (var i=0; i < menu.Data.length; i++) {
      var rowValues = [];
      for (var k=0; k < fieldArr.length; k++) {
        rowValues.push(menu.Data[i][fieldArr[k]]);
      }
      values.push(rowValues);
    }

    var sql = 'INSERT INTO menu (' + fields + ') VALUES ?'
    connection.query(sql, [values], function(err,response){
      if(err) {
        throw err;
      }
      res.json({"result": "success"});
    });
  });
});

function isLoggedIn(req, res, next) {

/*
  // if user is authenticated in the session, carry on
	if (req.isAuthenticated())
  return next();
*/

	if (req.isAuthenticated()) {
    if (req.user.Role == "ADMIN" || req.user.Role == "ACTIVE") {
			return next();
		} else {
      res.redirect('/waiting');
      return;
		}
  }

	res.redirect('/login');
}

function isLoggedInForWaiting(req, res, next) {

  if (req.isAuthenticated()) {
    if (req.user.Role == "ADMIN" || req.user.Role == "ACTIVE") {
      res.redirect('/index');
			return;
		} else {
      return next();
		}
  }

	res.redirect('/login');
}
module.exports = router;