angular.module('andes.controllers').controller('TerminarCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );  
  $scope.$on('$destroy', deregisterFirst);

  $scope.buttonName = "CONFIRMAR TERMINAR";

  $scope.stepName = '';
  $scope.nextName = '';
  $scope.activeTab = 'people';
  $scope.ot = null;
  $scope.enableOp = false;
  $rootScope.modoEscaner = 'leer'; 
  $scope.popCloseable = null;
  $scope.add = {moving: true};

  //if ($stateParams.step == "7") { $scope.stepName = "CALIDAD"; }
  $scope.setStep = function(sx) {
    $stateParams.step = sx;
    if ($stateParams.step == "3") { $scope.stepName = "CORTE"; $scope.buttonName = "TERMINO Y LOTEO"; $scope.nextName = "Mover a Armado"; }
    if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; $scope.nextName = "Mover a Soldadura"; }
    if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; $scope.nextName = "Mover a Terminación"; }
    if ($stateParams.step == "6") { $scope.stepName = "TERMINACIÓN"; $scope.nextName = "Generar Packing"; }
  }

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.stepName = '';
      $scope.activeTab = '';
      $scope.ot = null;
      $scope.enableOp = false;
      $rootScope.modoEscaner = 'leer'; 
      $scope.popCloseable = null;
      $scope.add = {moving: true};
    }
    //$scope.setStep(3);
  });

  $scope.setStep($stateParams.step);


  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.stepName = '';
    $scope.activeTab = '';
    $scope.ot = null;
    $scope.enableOp = false;
    $rootScope.modoEscaner = 'leer'; 
    $scope.popCloseable = null;
    $scope.add = {moving: true};
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
  $scope.groupPeoplePiece = function(x) {
    if ($scope.ot) { 
      return $scope.ot.pieces.filter(function(item){ return item['people'] === x; }).map(function (a) { return a; });
    }
  }
  $scope.groupPeople = function() {
    var g = [];
    if ($scope.ot) {
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if (g.indexOf($scope.ot.pieces[i].people) == -1) {
          g.push($scope.ot.pieces[i].people);
        }
      }
    }
    return g;
  }

  $scope.changeTodoGrupo = function(llave,grupo,b) {
    if ($scope.ot) { $scope.ot.pieces.filter(function(item){ return item[llave] === grupo; }).map(function (a) { a.selected = b; }); }
  }

  $scope.changeTab = function(a) {
    $scope.activeTab = a;
  }
  

  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=ot&find=pending_finish&step=" + $stateParams.step, { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          playerror();
          return; 
        }
        if (data.pieces.length == 0) { 
          $rootScope.err("No hay piezas para terminar en esta etapa en la OT "+data.ot+"-"+data.corr); 
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
        $rootScope.modoEscaner = "pieza";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply(); 
      },"json");
    }
    else if ($rootScope.modoEscaner == "pieza") {
      var found = 0;
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if ($scope.ot.pieces[i].internalcode == args.barcode) {
          $scope.ot.pieces[i].selected = true;
          found = 1;
          break;
        }
      }
      if (found == 0) {
        $rootScope.err("Pieza no se encuentra en las disponibles");
        playerror();
      }
    } 
  });

  $scope.prepareInicio = function() {
    if ($scope.buttonName == "TERMINO Y LOTEO") {
      $rootScope.confirmar("Va a cerrar el lote, está seguro?", function() {
        $scope.confirmada();
      });
    }
    else if ($stateParams.step == "6") {
      $rootScope.confirmar("Dejar disponible para packing list?", function() {
        $scope.confirmada();
      });
    }
    else {
      $rootScope.confirmar("Terminar etapa y avanzar a la siguiente, está seguro?", function() {
        $scope.confirmada();
      });
    }
  }

  $scope.confirmada = function() {
    $rootScope.showload();
    var moving = $scope.ot.pieces.filter(({ selected }) => selected).map(({ internalcode }) => internalcode);
    jQuery.post(app.rest+"ajax.mobile.data.php&a=finish", { 
      closing: $stateParams.step,
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
      $rootScope.modoEscaner = "leer";
      $scope.activeTab = 'people';
      $scope.$broadcast('scroll.resize');
      $rootScope.$apply();
    },"json"); 
  };
  $scope.cancelarTermino = function() {
    if ($scope.ot) { $rootScope.confirmar("Cancelar?", function() { $scope.chao(); }); }
    else { $scope.chao(); }
  }
  $scope.chao = function() {
    $ionicHistory.nextViewOptions({ historyRoot: true }); 
    $state.go('main.selector');
  }
})