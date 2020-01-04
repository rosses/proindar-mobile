angular.module('plgn.ionic-segment',[]).directive('ionSegment', function() {
    return {
      restrict: 'E',
      require: "ngModel",
      transclude: true,
      replace: true,
      scope: {
        full: '@full'
      },
      template: '<ul id="ion-segment" class="the_i_segment" ng-transclude></ul>',
      link: function($scope, $element, $attr, ngModelCtrl) {
        if ($scope.full == "true") {
          $element.find("li").addClass("full");
        }

        /*
        ngModelCtrl.$render = function(){
           //Do something with your model
           var actualValue = ngModelCtrl.$modelValue;
           console.log(actualValue);
           ngModelCtrl.$setViewValue(actualValue);
           //$scope.$apply();
        }
        */
        var segment = $element.find("li").eq(1).attr("value");
        $element.find("li").eq(1).addClass("active");
        ngModelCtrl.$setViewValue(segment);
      }
    }
  })
  .directive('ionSegmentButton', function() {
    return {
      restrict: 'E',
      require: "^ngModel",
      transclude: true,
      replace: true,
      template: '<li ng-transclude></li>',
      link: function($scope, $element, $attr, ngModelCtrl) {
        var value;
        function onChange(){
          if(value === ngModelCtrl.$modelValue){
            $element.parent().find("li").removeClass("active");
            $element.addClass("active");
          }
        }
        $scope.$watch(function(){
          return ngModelCtrl.$modelValue;
        }, onChange);
        $attr.$observe("value", function(_value){
          value = _value;
          onChange();
        });

        var clickingCallback = function() {
          ngModelCtrl.$setViewValue(value);
        };

        $element.bind('click', clickingCallback);

      }
    }
  })
