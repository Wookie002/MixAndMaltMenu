var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var _ = require("underscore");
var maxSize =  2 * 1024*1024;
var path = require('path');

var connection = require('../config/db');

//var basePath = '/home/hosting_users/mixandmalt/apps/mixandmalt_ipadmenu/public/upload/';
var basePath = path.resolve("./") + '/public/upload/';

var storage =  multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath);
    }
    cb(null, basePath);
  },
   filename: function ( req, file, cb ) {
    var originalname = file.originalname;
    var extension = originalname.split(".");

    cb(null, file.fieldname + '-' + Date.now()+ '.' + extension[extension.length-1]);
  }
})

var uploading = multer({ storage: storage }).fields([
  { name: 'thumbnail', maxCount: 1 ,limits: { fileSize: maxSize }},
  { name: 'mainImage1', maxCount: 1 ,limits: { fileSize: maxSize }}
]);

/**
  Update menu
*/
router.post('/updateMenu', isLoggedIn, function(req, res, next) {

  uploading(req, res, function(err) {
    var menu = req.body.item;
    var files = req.files;
    var addDocuments = "Documents/";

    if (files.thumbnail && files.thumbnail.length > 0) {

      if (fs.existsSync(basePath + menu.thumbnail)) {
        fs.unlinkSync(basePath + menu.thumbnail);
      }
      menu.thumbnail = addDocuments+files.thumbnail[0].filename;
    }

    if (files.mainImage1 && files.mainImage1.length > 0) {

      if (fs.existsSync(basePath + menu.MainImage1)) {
        fs.unlinkSync(basePath + menu.MainImage1);
      }
      menu.MainImage1 = addDocuments+files.mainImage1[0].filename;
    }

    delete menu['$hashKey'];
    console.log(menu);

    for( key in menu) {
      if (menu[key] == "null") {
        menu[key] = null;
      }
    }

    connection.query('UPDATE menu SET '
    + 'SubCategoryA = ? ,'
    + 'SubCategoryB = ? ,'
    + 'SubMessage = ? ,'
    + 'MultiLine = ? ,'
    + 'Name_eng = ? ,'
    + 'Name_kor = ? ,'
    + 'Line1_eng = ? ,'
    + 'Line2_eng = ? ,'
    + 'Line1_kor = ? ,'
    + 'Line2_kor = ? ,'
    + '`option` = ? ,'
    + 'optionA = ? ,'
    + 'priceA = ? ,'
    + 'imageA = ? ,'
    + 'optionB = ? ,'
    + 'priceB = ? ,'
    + 'imageB = ? ,'
    + 'thumbnail = ? ,'
    + 'type = ? ,'
    + 'MainImage1 = ? ,'
    + 'MainImage2 = ? ,'
    + 'MainImage3 = ? ,'
    + 'BackgroundImage = ? ,'
    + 'text_eng = ? ,'
    + 'text_kor = ? ,'
    + 'isAdd = ? '
    + ' WHERE Num = ? AND MainCategoryCode = ?', [
        menu.SubCategoryA
      , menu.SubCategoryB
      , menu.SubMessage
      , menu.MultiLine != null ?parseInt(menu.MultiLine):null
      , menu.Name_eng
      , menu.Name_kor
      , menu.Line1_eng
      , menu.Line2_eng
      , menu.Line1_kor
      , menu.Line2_kor
      , menu.option != null ?parseInt(menu.option):null
      , menu.optionA
      , menu.priceA != null ?parseInt(menu.priceA):null
      , menu.imageA
      , menu.optionB
      , menu.priceB != null ?parseInt(menu.priceB):null
      , menu.imageB
      , menu.thumbnail
      , menu.type != null ?parseInt(menu.type):null
      , menu.MainImage1
      , menu.MainImage2
      , menu.MainImage3
      , menu.BackgroundImage
      , menu.text_eng
      , menu.text_kor
      , menu.isAdd
      , menu.Num != null ?parseInt(menu.Num):null, menu.MainCategoryCode], function(err,response){

      if(err) throw err;
      console.log('Last record insert id:', response);

      if(err) {
          return res.end("Error uploading file.");
      }

      res.end("File is uploaded");
    });
  });
});

/**
  Add menu
*/
router.post('/addMenu', isLoggedIn, function(req, res, next) {

  uploading(req, res, function(err) {
    var addMenu = req.body.addMenu;
    var selectedSubCateMenues = req.body.selectedSubCateMenues;
    var subCategories = req.body.subCategories;
    var files = req.files;
    // 파일경로 설정
    var addDocuments = "Documents/";

    if (addMenu) {
      delete addMenu.isAdd;
    }

    if (files.thumbnail && files.thumbnail.length > 0) {

      if (fs.existsSync(basePath + addMenu.thumbnail)) {
        fs.unlinkSync(basePath + addMenu.thumbnail);
      }
      addMenu.thumbnail = addDocuments+files.thumbnail[0].filename;
    }

    if (files.mainImage1 && files.mainImage1.length > 0) {

      if (fs.existsSync(basePath + addMenu.MainImage1)) {
        fs.unlinkSync(basePath + addMenu.MainImage1);
      }
      addMenu.MainImage1 = addDocuments+files.mainImage1[0].filename;
    }

    var query = connection.query('select * from category where Category = ?',[addMenu.MainCategory],function(err,rows){
      var menu = rows[0];
      var query = connection.query('select * from menu where MainCategory = ?',[addMenu.MainCategory],function(err,rows){
        menu.Data = rows;

        if (subCategories.indexOf(addMenu.SubCategoryA) < 0) {
          subCategories.push(addMenu.SubCategoryA);
        }

        if(!selectedSubCateMenues){
          selectedSubCateMenues = new Array;
        }

        selectedSubCateMenues.push(addMenu);

        var resultMenu = [];
        // 서브카테고리 별로 메뉴목록을 생성하여 최종으로 resultMenu 메뉴목록을 만들고
        for (var i=0; i < subCategories.length; i++) {
    			var menueList = [];

    			if (subCategories[i] == addMenu.SubCategoryA) {
    				menueList = selectedSubCateMenues;
    			} else {
            menueList = _.where(menu.Data, {SubCategoryA: subCategories[i]});
            menueList = _.sortBy(menueList, 'Num');
    			}
    			resultMenu = resultMenu.concat(menueList);
    		}

        for (var k=0; k < resultMenu.length; k++) {

          for( key in resultMenu[k]) {
            if (resultMenu[k][key] == "null") {
              resultMenu[k][key] = null;
            }
          }

          resultMenu[k].Num = k+1;
  				resultMenu[k].MultiLine = resultMenu[k].MultiLine != null ?parseInt(resultMenu[k].MultiLine):null;
  				resultMenu[k].option = resultMenu[k].option != null ?parseInt(resultMenu[k].option):null;
  				resultMenu[k].priceA = resultMenu[k].priceA != null ?parseInt(resultMenu[k].priceA):null;
  				resultMenu[k].priceB = resultMenu[k].priceB != null ?parseInt(resultMenu[k].priceB):null;
  				resultMenu[k].type = resultMenu[k].type != null ?parseInt(resultMenu[k].type):null;
        }
        // 메인메뉴 삭제후 다시 저장
        connection.query('DELETE FROM menu WHERE MainCategory = ?', addMenu.MainCategory, function(err, result){
          if(err) throw err;

          if(resultMenu == null || resultMenu.length < 1) throw new Error('Empty save data.');

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
          for (var i=0; i < resultMenu.length; i++) {
            var rowValues = [];
            for (var k=0; k < fieldArr.length; k++) {
              rowValues.push(resultMenu[i][fieldArr[k]]);
            }
            values.push(rowValues);
          }

          var sql = 'INSERT INTO menu (' + fields + ') VALUES ?'
          connection.query(sql, [values], function(err,response){
            if(err) {
              console.log(err);
              throw err;
            }
            res.end("File is uploaded");
          });
        });
      });
    })
  });
});

/*
  Delete menu
**/
router.post('/deleteMenu', isLoggedIn, function(req, res, next) {
  var menu = req.body;
  var thumbnail = (!menu.thumbnail)? "": menu.thumbnail.substr(menu.thumbnail.lastIndexOf("/")+1);
  var mainImage1 = (!menu.MainImage1)? "": menu.MainImage1.substr(menu.MainImage1.lastIndexOf("/")+1);

  if (fs.existsSync(basePath + thumbnail)) {
    fs.unlinkSync(basePath + thumbnail);
  }

  if (fs.existsSync(basePath + mainImage1)) {
    fs.unlinkSync(basePath + mainImage1);
  }

  connection.query('DELETE FROM menu WHERE MainCategory = ? AND Num = ?', [menu.MainCategory, menu.Num], function(err, result){
    res.end("delete");
  });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

module.exports = router;