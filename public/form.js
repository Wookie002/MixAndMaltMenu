menu.controller('menuDetailControlller', function ($scope, $rootScope, $http, Upload, $uibModalInstance, $filter, item, sharedProperties) {
	// 저장될 메뉴
	$scope.item = item;
	// 저장될 메뉴에 서브카테고리
	$scope.subCategories = sharedProperties.getSubCategories();
	//전체 메인 카테고리의 메뉴
	$scope.menus = sharedProperties.getMenus();
	// 각카테고리별 옵션라벨및 설정
	$scope.optionConfig = {
		"beer":{"optionA":"하프 파인트", "imageA":"Option_Halfpint", "optionB":"파인트", "imageB":""},
		"bottle":{"optionA":"잔", "imageA":"Option_Glass", "optionB":"병", "imageB":"Option_Bottle"},
		"daytime":{"optionA":"따뜻한", "imageA":"Option_Hot", "optionB":"차가운", "imageB":"Option_Iced"},
		"malt":{"optionA":"잔", "imageA":"Option_Glass", "optionB":"병", "imageB":"Option_Bottle"},
	};

	$scope.setOptionConfig = function (item) {
		if (item.option == "1" && $scope.optionConfig[item.MainCategoryCode]) {
			item.optionA = $scope.optionConfig[item.MainCategoryCode].optionA;
			item.imageA = $scope.optionConfig[item.MainCategoryCode].imageA;
			item.optionB = $scope.optionConfig[item.MainCategoryCode].optionB;
			item.imageB = $scope.optionConfig[item.MainCategoryCode].imageB;
		}
		return item;
	}
	// when submitting the add form, send the text to the node API
	$scope.update = function (item) {
		$scope.item = $scope.setOptionConfig($scope.item);
		waitingDialog.show();
      	$scope.upload = Upload.upload({
        	url: '/updateMenu',
        	method: 'POST',
        	data : {
        	  thumbnail:$scope.thumbnail
						, mainImage1:$scope.mainImage1
						, item : $scope.item
        }});

		$scope.upload.then(function(resp) {
			console.log("success");
			waitingDialog.hide();
			$rootScope.$broadcast('getMenuList', item.MainCategory);
		}, function(resp) {
  			console.log("error");
			waitingDialog.hide();
		}, function(evt) {
		});
		$uibModalInstance.close();
  	};

  	$scope.ok = function () {
  	  $uibModalInstance.close();
  	};

  	$scope.cancel = function () {
  	  $uibModalInstance.dismiss('cancel');
  	};

	// 메뉴추가
	$scope.add = function (addMenu) {
		if (!addMenu || !addMenu.SubCategoryA) {
			return;
		}

		addMenu.Num = 0;
		addMenu = $scope.setOptionConfig(addMenu);
		// 선택한 서브메뉴의 속해있는 메뉴목록
		var selectedSubCateMenues = [];
		// 추가한 메뉴가 생성되어있는 서브메뉴에 속해 있는지 확인
		if ($scope.subCategories.indexOf(addMenu.SubCategoryA) > -1) {
			$(".menuItm").each(function(index, obj) {
				var menuItm = angular.element(obj).scope();

				var menuJson = JSON.parse(angular.toJson(menuItm.menu));
				menuJson.Num = menuJson.Num != null ?parseInt(menuJson.Num):null;
				menuJson.MultiLine = menuJson.MultiLine != null ?parseInt(menuJson.MultiLine):null;
				menuJson.option = menuJson.option != null ?parseInt(menuJson.option):null;
				menuJson.priceA = menuJson.priceA != null ?parseInt(menuJson.priceA):null;
				menuJson.priceB = menuJson.priceB != null ?parseInt(menuJson.priceB):null;
				menuJson.type = menuJson.type != null ?parseInt(menuJson.type):null;

				selectedSubCateMenues.push(menuJson);
			});
		}

		waitingDialog.show();
		$scope.upload = Upload.upload({
			url: '/addMenu',
			method: 'POST',
			data : {
				thumbnail:$scope.thumbnail
				, mainImage1:$scope.mainImage1
				, "subCategories" : $scope.subCategories
				, "addMenu" : addMenu
				, "selectedSubCateMenues" : selectedSubCateMenues
			}
		});

		$scope.upload.then(function(resp) {
			console.log("success");
			waitingDialog.hide();
			$rootScope.$broadcast('getMenuList', addMenu.MainCategory);
		}, function(resp) {
			console.log("error");
			waitingDialog.hide();
		}, function(evt) {
			waitingDialog.hide();
		});

		$uibModalInstance.close();
  };

	$scope.delete = function (menu) {
		waitingDialog.show();
		$http.post('/deleteMenu', JSON.stringify(menu))
		.success(function(data) {
			$rootScope.$broadcast('getMenuList', menu.MainCategoryCode);
			waitingDialog.hide();
		})
		.error(function(data) {
			console.log('Error: ' + data);
			waitingDialog.hide();
		});

		$uibModalInstance.close();
	}

	$scope.$watch('item.option', function(value) {
			if (value == 1) {

			} else {

			}
 	});
});
