//
angular.module('andes.controllers', [])
.controller('MainCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicModal, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate, $ionicHistory) {

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.inicio = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.consultarPieza = function() {
    $rootScope.prevScanner = $rootScope.modoEscaner;
    $rootScope.modoEscaner = "consultarPieza";
    $rootScope.lectorPieza = $rootScope.ok("Lea la pieza a consultar", "Consulta Pieza", function(ok) {
        console.log('cancelada volviendo a '+$rootScope.prevScanner);
        $rootScope.modoEscaner = $rootScope.prevScanner;
    },"Cancelar");
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "consultarPieza") {
      event.defaultPrevented = true; 
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=donde", { barra: args.barcode }, function(data) {
        $rootScope.lectorPieza.close();
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          playerror();
          return; 
        }
        //console.log(data);
        $rootScope.ok(data.msg,"Consulta de pieza");
        
      },"json");
    }
   });
})
String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}
function miles(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}