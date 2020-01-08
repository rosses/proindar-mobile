angular.module('andes.controllers')
.controller('ReceiveotCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform, $ionicScrollDelegate) {
  $scope.popCloseable = null;
  $scope.packet = [];
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.ot = null;
  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.packet = [];
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.ot = null;
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.packet = [];
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.ot = null;
  }); 
  $scope.recibirTodo = function() {
    $rootScope.confirmar('Confirmar la recepción de '+$scope.ot.unReceived.length+' piezas?', function() {      
      var sender = [];
      for (var i = 0; i < $scope.ot.unReceived.length; i++) {
        sender.push({
          internalcode: $scope.ot.unReceived[i].internalcode
        });
      }
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=pm_all", { 
        ot: $scope.ot.id, 
        autor: localStorage.getItem('user') 
      }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          return; 
        }
        $rootScope.ok(data.msg);
        $scope.ot = null;
        $scope.enableOp = false;
        $scope.packet = [];
        $scope.modoEscaner = "leer";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
      },"json");

    });
  };

  $scope.borrar = function (internalcode) {
    $rootScope.confirmar('Quitar?', function() {
      for (var i = 0; i < $scope.packet.length; i++) {
        if ($scope.packet[i].internalcode == internalcode) {
          $scope.packet.splice(i,1);
          break;
        }
      }
    });
  };
  $scope.$on('scanner', function(event, args) {
    console.log('selectorCtrl::scanner::mode->'+$scope.modoEscaner+'::', args);
    if ($scope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=ot", { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          return; 
        }
        if (data.unReceived.length == 0) { 
          $rootScope.err("No hay piezas pendientes para recibir en la OT indicada"); 
          return;
        }
        $scope.ot = data;
        $scope.enableOp = true;
        $scope.packet = [];
        $scope.modoEscaner = "lotear";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply(); 
      },"json");;
    }
    else if ($scope.modoEscaner == "lotear") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=pieza&to=packet", { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        $scope.pieza = "";
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        var add = 1;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe");
            add = 0;
            break;
          }
        }
        if (data.OT != $scope.ot.fullname) {
          add = 0;
          $rootScope.err("Pieza leida es de otra OT");
        }
        if (add==1) {
          $scope.packet.push({
            mark: data.mark,
            dimtype: data.dimtype,
            kg: parseFloat(data.totalkg),
            internalcode: data.internalcode
          });
        }
        $scope.$broadcast('scroll.resize');
        $ionicScrollDelegate.scrollBottom();
        $rootScope.$apply();
      },"json");

    } 
  });
  $scope.confirmarRecibir = function() {
    if ($scope.packet.length == 0) {
      $rootScope.err("No esta recibiendo nada");
    }
    else {
      $rootScope.confirmar("Desea confirmar la recepción para P.M?", function() {
        $rootScope.showload();
        jQuery.post(app.rest+"ajax.mobile.data.php&a=pm", { 
          ot: $scope.ot.id,
          items: $scope.packet,
          autor: localStorage.getItem('user')
        }, function(data) {
          $rootScope.hideload();
          if (data.error) {
            $rootScope.err(data.error);
            return;
          }
          $rootScope.ok(data.msg);
          $scope.ot = null;
          $scope.enableOp = false;
          $scope.packet = [];
          $scope.modoEscaner = "leer";
          $scope.$broadcast('scroll.resize');
          $rootScope.$apply();
        },"json");
      });
    }
  }

  $scope.cancelarRecibir = function() {
    $rootScope.confirmar("Volver al inicio?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });
  }
})