var menu = angular.module('menu', ['ui.bootstrap', 'ngFileUpload', 'angular.filter', 'ngMessages','ui.sortable']);

menu.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

menu.service('sharedProperties', function () {
        var subCategories = {};
        var menus = [];
        var category = "";

        return {
            getSubCategories: function () {
                return subCategories;
            },
            setSubCategories: function(value) {
                subCategories = value;
            },
            getMenus: function () {
                return menus;
            },
            setMenus: function(value) {
                menus = value;
            },
            getCategory: function () {
                return category;
            },
            setCategory: function(value) {
                category = value;
            }
        };
});
