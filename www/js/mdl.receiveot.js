angular.module('andes.controllers')
.controller('ReceiveotCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform, $ionicScrollDelegate) {
  $scope.popCloseable = null;
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.ot = null;
  $scope.activeTab = 'marca';

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.ot = null;
      $scope.activeTab = 'marca';
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.ot = null;
    $scope.activeTab = 'marca';
  }); 

  $scope.marcarTodo = function() {
    for (var i = 0; i < $scope.ot.pieces.length; i++) {
      $scope.ot.pieces[i].selected = true;
    }
  };
  $scope.desmarcarTodo = function() {
    for (var i = 0; i < $scope.ot.pieces.length; i++) {
      $scope.ot.pieces[i].selected = false;
    }
  };

  $scope.getSelected = function() {
    var t = 0;
    if ($scope.ot) {
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if ($scope.ot.pieces[i].selected) {
          t++;
        }
      }
    }
    return t;
  } 
  $scope.$on('scanner', function(event, args) { 
    if ($scope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=ot&find=unreceived", { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          playerror();
          return; 
        }
        if (data.pieces.length == 0) { 
          $rootScope.err("No hay piezas pendientes en la OT "+data.ot+"-"+data.corr); 
          playerror();
          return;
        }
        $scope.ot = data;
        var found = 0;
        for (var i = 0; i < $scope.ot.pieces.length; i++) {
          $scope.ot.pieces[i].selected = false;
          if ($scope.ot.pieces[i].internalcode == args.barcode) {
            $scope.ot.pieces[i].selected = true;
            found = 1;
          }
        }
        if (found == 0) {
          $rootScope.err("Se cargo la OT, pero la pieza no está disponible");
          playerror();
        }
        $scope.enableOp = true;
        $scope.modoEscaner = "pieza";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply(); 
      },"json");
    }
    else if ($scope.modoEscaner == "pieza") {
      var found = 0;
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if ($scope.ot.pieces[i].internalcode == args.barcode) {
          $scope.ot.pieces[i].selected = true;
          found = 1;
          break;
        }
      }
      if (found == 0) {
        $rootScope.err("No se encontro en la lista la pieza");
        playerror();
      }
    } 
  });
  $scope.groupMarca = function() {
    var g = [];
    if ($scope.ot) {
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if (g.indexOf($scope.ot.pieces[i].mark) == -1) {
          g.push($scope.ot.pieces[i].mark);
        }
      }
    }
    return g;
  }
  $scope.groupMarcaPiece = function(x) {
    if ($scope.ot) { 
      return $scope.ot.pieces.filter(function(item){ return item['mark'] === x; }).map(function (a) { return a; });
    }
  }
  $scope.groupPanel = function() {
    var g = [];
    if ($scope.ot) {
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if (g.indexOf($scope.ot.pieces[i].p_module) == -1) {
          g.push($scope.ot.pieces[i].p_module);
        }
      }
    }
    return g;
  }
  $scope.groupPanelPiece = function(x) {
    if ($scope.ot) { 
      return $scope.ot.pieces.filter(function(item){ return item['p_module'] === x; }).map(function (a) { return a; });
    }
  }
  $scope.changeTodoGrupo = function(llave,grupo,b) {
    if ($scope.ot) { $scope.ot.pieces.filter(function(item){ return item[llave] === grupo; }).map(function (a) { a.selected = b; }); }
  }

  $scope.changeTab = function(a) {
    $scope.activeTab = a;
  }
  $scope.confirmarRecibir = function() {
    $rootScope.confirmar("¿Desea confirmar la recepción para PREPARACIÓN DE MATERIAL de "+$scope.getSelected()+" piezas?", function() {
      $rootScope.showload();
      var moving = $scope.ot.pieces.filter(({ selected }) => selected).map(({ internalcode }) => internalcode);
      jQuery.post(app.rest+"ajax.mobile.data.php&a=update", { 
        to: 2,
        pieces: moving,
        by: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        $rootScope.ok(data.msg);
        $scope.ot = null;
        $scope.enableOp = false;
        $scope.modoEscaner = "leer";
        $scope.activeTab = 'marca';
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
      },"json"); 
    }); 
  }
  $scope.cancelarRecibir = function() {
    if ($scope.ot) { $rootScope.confirmar("Cancelar?", function() { $scope.chao(); }); }
    else { $scope.chao(); }
  }
  $scope.chao = function() {
    $ionicHistory.nextViewOptions({ historyRoot: true }); 
    $state.go('main.selector');
  }
})