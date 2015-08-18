var myApp = angular.module('myApp', []);

function myCtrl($scope) {

    $scope.myData = [];
    $scope.myLimit = 50;
    // SET THIS TO 2000 TO SEE HOW MUCH SLOWER THE PAGE WILL LOAD WITHOUT THE INFINITE SCROLL

    $scope.increaseLimit = function () {
        $scope.myLimit += 10;
    };

    $scope.loadData = function () {
        for (var i = 0; i < 2000; i++) {
            $scope.myData.push({
                Name: 'Test Line ' + i,
                Data: i
            });
        }
    };

    $scope.loadData();
}


myApp.directive('infiniteScroll', function () {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            var myElement = element[0];
            element.bind('scroll', function () {                  
                if (myElement.scrollTop + myElement.offsetHeight > myElement.scrollHeight - 2) {
                    $scope.increaseLimit();
                    $scope.$apply();
                }
            });
        }
    };
});