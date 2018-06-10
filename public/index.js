menu.controller('mainController', function ($scope, $http, $uibModal, $filter, sharedProperties, $window) {
	$scope.formData = {};
	$scope.subCategories = [];
	$scope.topMainCategories = [{Code: "cocktail", Category:"Cocktail"}
	, {Code: "malt", Category:"Single Malt"}
	, {Code: "bottle", Category:"Bottle"}
	, {Code: "wine", Category:"Wine"}
	, {Code: "beer", Category:"Beer"}
	, {Code: "food", Category:"Food"}
	, {Code: "daytime", Category:"Daytime"}];
	$scope.selectedCategory = "cocktail";
	$scope.selectedSubCategory = "";

	$scope.getSubCategory = function (topMainCategory, menu) {
		if (topMainCategory.Code == menu.MainCategoryCode) {
			$scope.subCategories.push(menu.SubCategoryA);
		}
	};

	$http.get('/getMenuListView',{params:{"mainCategoryCode": "cocktail"}})
	.success(function(data) {
		$scope.subCategories = [];
		$scope.menus = data.Data;
		$scope.filterMenus = data.Data;
		$scope.root = data;
		$scope.getMenuSubListByFilter('');
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

	$scope.getTopMenuList = function (category, $event) {
		if ($scope.selectedCategory == category.Code) {
			return;
		}
		$scope.selectedCategory = category.Code;
		$scope.selectedSubCategory = "";
		$scope.getMenuList(category.Code);
	}

	$scope.getMenuList = function (category) {
		$http.get('/getMenuListView',{params:{"mainCategoryCode": category}})
		.success(function(data) {
			$scope.subCategories = [];
			$scope.menus = data.Data;
			$scope.root = data;
			$scope.getMenuSubListByFilter($scope.selectedSubCategory);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	};

	$scope.getMenuSubListByFilter = function (subCategory) {
		$scope.selectedSubCategory = subCategory;
		if (subCategory) {
			$scope.filterMenus = $filter('filter')($scope.menus, {SubCategoryA: subCategory}, true);
		} else {
			$scope.filterMenus = $scope.menus;
		}

		$scope.delayDragDrop($scope.selectedCategory);
	};

	var shapeshiftOptions = {minColums: 3};
	$scope.delayDragDrop = function (category) {
		setTimeout(function(){$(".menuWrapper").shapeshift(shapeshiftOptions);}, 300);
	}

	$scope.addMenu = function (menus, newMenus) {
		for (var i=0; i < newMenus.length; i++) {
			menus.push();
		}
	}

	$scope.isAdd = false;
	$scope.open = function (size, item, addSubCategory) {
		sharedProperties.setSubCategories($scope.subCategories);
		sharedProperties.setMenus($scope.menus);

		if (!item) {
			item = {};
			item.isAdd = true;
			item.MainCategory = $scope.root.Category;
			item.MainCategoryCode = $scope.root.Code;
			item.SubCategoryA = addSubCategory? addSubCategory:$scope.selectedSubCategory;
      		item.SubMessage = null;
			item.option=0;
    		item.MultiLine = 0;
			item.line1_eng = null;
			item.line2_eng = null;
			item.line1_kor = null;
			item.line2_kor= null;
			item.optionA="";
			item.priceA=null;
			item.imageA="";
			item.optionB="";
			item.imageB="";
			item.thumbnail= "Default_Main01.jpg";
			item.type = 1;
			item.MainImage1 = "Default_Thumb.jpg";
			item.MainImage2 = null;
			item.MainImage3 = null;
			item.BackgroundImage = "Default_Back.jpg";
			item.text_eng = "";
			item.text_kor = "";
		} else {
			item.isAdd = false;
		}

		$scope.item = item;
    	var modalInstance = $uibModal.open({
      		animation: true,
      		templateUrl: 'menuDetail.html',
      		controller: 'menuDetailControlller',
      		size: size,
      		resolve: {
        		item: function () {
          			return $scope.item;
        		}
      		}
    	});
		modalInstance.result.then(function () {}, function () {});
	};

	$scope.saveOrdering = function() {

		var newMenues = [];
		$(".menuItm").each(function(index, obj) {
			var menuItm = angular.element(obj).scope();
			newMenues.push(menuItm.menu);
		});

		var subCategories = $scope.subCategories;
		var resultMenu = [];
		// 선택한 서브메뉴의 속해있는 메뉴목록 생성후 resultMenu 대메뉴목록 생성
		for (var i=0; i < subCategories.length; i++) {
			var menues = new Array();

			if (subCategories[i] == $scope.selectedSubCategory) {
				menues = newMenues;
			} else {
			 	var menues = $filter('filter')($scope.menus, {SubCategoryA: subCategories[i]}, true);
			}
			resultMenu = resultMenu.concat(menues);
		}

		resultMenu = JSON.parse(angular.toJson(resultMenu));

		var saveMenuObj = {"Category": $scope.root.Category, "Code": $scope.root.Code, "Data":resultMenu};
		waitingDialog.show();
		$http.post('/saveMenu', saveMenuObj)
		.success(function(data) {
			$scope.getMenuList($scope.root.Category);
			waitingDialog.hide();
		})
		.error(function(data) {
			waitingDialog.hide();
		});
	}

  	$scope.finished = function() {
		$(".menuWrapper").shapeshift(shapeshiftOptions);
  	};

	// 서브카테고리 순번 업데이트
	$scope.updateSubCategory = function () {
		var resultMenu = [];

		for (var i=0; i < $scope.subCategories.length; i++) {
			var menues = new Array();
			var menues = $filter('filter')($scope.menus, {SubCategoryA: $scope.subCategories[i]}, true);
			resultMenu = resultMenu.concat(menues);
		}

		resultMenu = JSON.parse(angular.toJson(resultMenu));

		var saveMenuObj = {"Category": $scope.root.Category, "Code": $scope.root.Code, "Data":resultMenu};
		waitingDialog.show();
		$http.post('/saveMenu', saveMenuObj)
		.success(function(data) {
			$scope.getMenuList($scope.root.Category);
			waitingDialog.hide();
		})
		.error(function(data) {
			waitingDialog.hide();
		});
  	};

	// 서브카테고리 Drag and Drop
	$scope.sortableOptions = {
		stop: function(e, ui) {
			$scope.updateSubCategory();
		}
	};

	// 서브카테고리 삭제
	$scope.removeSubCategory = function(item, $event) {
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;

		if (!$window.confirm("서브메뉴 "+ item +" 삭제 하시겠습니까?")) {
      		return;
    	}

		var index = $scope.subCategories.indexOf(item);
		$scope.subCategories.splice(index, 1);

		if ($scope.subCategories.length != 0 && $scope.selectedSubCategory != "") {
			if (index > $scope.subCategories.length-1) {
				$scope.selectedSubCategory = $scope.subCategories[$scope.subCategories.length-1];
			} else {
				$scope.selectedSubCategory = $scope.subCategories[index];
			}
		} else {
			$scope.selectedSubCategory == "";
		}
		
		$scope.updateSubCategory();
	};

	$scope.$on('getMenuList', function(event, category) {
		$scope.getMenuList(category);
	});

	$scope.addSubCategory = function (subCategory) {
		$scope.selectedSubCategory = subCategory;
		$scope.open('lg', null);
	};

	$scope.clickLiSubCategory = function ($event) {
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
	}

	// 서브메뉴 추가 버튼
	$scope.openAddSubCategory = function ($event) {

		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;

		var elem = $event.currentTarget || $event.srcElement;
		var addSubCategory = $(elem).prev().val();

		if (!$.trim(addSubCategory)) {
			$(".addSubCateErroMsg").text("필수 입력입니다.");
			return;
		}

		if ($scope.subCategories.indexOf(addSubCategory) > -1) {
			$(".addSubCateErroMsg").text("중복된 서브메뉴명을 입력 할 수 없습니다.");
			return;
		}

		$scope.open('lg', null, addSubCategory);

		$(".addSubCateErroMsg").text("");
		$(elem).prev().val("");
	}

	$scope.avoidClose = function($event) {
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
	};

	var shapeshiftInitStatus;
	$(window).on('resize', function(){
		var win = $(this); //this = window
		if (win.width() <= 600) {
			if (!shapeshiftInitStatus || shapeshiftInitStatus == "normal-browser") {
				setTimeout(function(){$(".menuWrapper").shapeshift(shapeshiftOptions);}, 320);
				shapeshiftInitStatus = "mobile-browser";
				console.log("mobile-browser");
			}
		} else if (win.width() > 600) {
			if (!shapeshiftInitStatus || shapeshiftInitStatus == "mobile-browser") {
				setTimeout(function(){$(".menuWrapper").shapeshift(shapeshiftOptions);}, 320);
				shapeshiftInitStatus = "normal-browser";
				console.log("normal-browser");
			}
		}
	});
});
