angular.module('andes.controllers').controller('AsignarCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );

  $scope.$on('$destroy', deregisterFirst);
  $scope.stepName = '';
  $scope.activeTab = '';
  $scope.ot = null;
  $scope.enableOp = false;
  $scope.modoEscaner = 'leer'; 
  $scope.popCloseable = null;
  $scope.ejecutores = [];
  $scope.ejecutor = {id: ''};

  //if ($stateParams.step == "7") { $scope.stepName = "CALIDAD"; }
  $scope.setStep = function(sx) {
    $stateParams.step = sx;
    if ($stateParams.step == "3") { $scope.stepName = "CORTE"; $scope.activeTab = 'panel'; }
    if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; $scope.activeTab = 'lote_internal'; }
    if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; $scope.activeTab = 'lote_internal'; }
    if ($stateParams.step == "6") { $scope.stepName = "TERMINACIÓN"; $scope.activeTab = 'lote_internal'; }
  }


  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.stepName = '';
      $scope.activeTab = '';
      $scope.ot = null;
      $scope.enableOp = false;
      $scope.modoEscaner = 'leer'; 
      $scope.popCloseable = null;
      $scope.ejecutores = [];
      $scope.ejecutor = {id: ''};
    } 
    //$scope.setStep(3); // debug only
  });

  $scope.setStep($stateParams.step);

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.stepName = '';
    $scope.activeTab = '';
    $scope.ot = null;
    $scope.enableOp = false;
    $scope.modoEscaner = 'leer'; 
    $scope.popCloseable = null;
    $scope.ejecutores = [];
    $scope.ejecutor = {id: ''};
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
      jQuery.post(app.rest+"ajax.mobile.data.php&a=ot&find=step&for_step="+($stateParams.step), { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          playerror();
          return; 
        }
        if (data.pieces.length == 0) { 
          $rootScope.err("No hay piezas para asignar en "+$scope.stepName+" en la OT "+data.ot+"-"+data.corr);
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
  $scope.groupLote = function() {
    var g = [];
    if ($scope.ot) {
      for (var i = 0; i < $scope.ot.pieces.length; i++) {
        if (g.indexOf($scope.ot.pieces[i].lote_internal) == -1) {
          g.push($scope.ot.pieces[i].lote_internal);
        }
      }
    }
    return g;
  }
  $scope.groupLotePiece = function(x) {
    if ($scope.ot) { 
      return $scope.ot.pieces.filter(function(item){ return item['lote_internal'] === x; }).map(function (a) { return a; });
    }
  }
  $scope.changeTodoGrupo = function(llave,grupo,b) {
    if ($scope.ot) { $scope.ot.pieces.filter(function(item){ return item[llave] === grupo; }).map(function (a) { a.selected = b; }); }
  }

  $scope.changeTab = function(a) {
    $scope.activeTab = a;
  }

  $scope.modalInicio = null;
  $ionicModal.fromTemplateUrl('templates/modal_emp_inicio.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalInicio = modal;
  });

  $scope.closeSalida = function() {
    $scope.modalInicio.hide();
    //$scope.modoEscaner = "pieza";
  }

  $scope.prepareInicio = function() {
    $scope.ejecutores = [];
    $rootScope.showload();
    //$scope.modoEscaner = "persona";
    jQuery.post(app.rest+"ajax.mobile.data.php&a=employee", {step: $stateParams.step}, function(data) {
      $scope.ejecutores = data;
      $rootScope.hideload();
      $scope.modalInicio.show();
    },"json");
  }

  //$scope.setejecutor = function(x) { $scope.ejecutor = x; }

  $scope.confirmada = function() {
    //$rootScope.confirmar("¿Desea confirmar la recepción para PREPARACIÓN DE MATERIAL de "+$scope.getSelected()+" piezas?", function() {
    $rootScope.showload();
    var moving = $scope.ot.pieces.filter(({ selected }) => selected).map(({ internalcode }) => internalcode);
    jQuery.post(app.rest+"ajax.mobile.data.php&a=update", { 
      to: $stateParams.step,
      pieces: moving,
      by: localStorage.getItem('user'),
      ejecutor: $scope.ejecutor.id
    }, function(data) {
      $rootScope.hideload();
      if (data.error) {
        $rootScope.err(data.error);
        return;
      }
      $scope.modalInicio.hide();
      $rootScope.ok(data.msg);
      $scope.ot = null;
      $scope.enableOp = false;
      $scope.modoEscaner = "leer";
      $scope.activeTab = 'marca';
      $scope.$broadcast('scroll.resize');
      $rootScope.$apply();
    },"json"); 
    //}); 
  }; 

  $scope.cancelarInicio = function() {
    if ($scope.ot) { $rootScope.confirmar("Cancelar?", function() { $scope.chao(); }); }
    else { $scope.chao(); }
  }
  $scope.chao = function() {
    $ionicHistory.nextViewOptions({ historyRoot: true }); 
    $state.go('main.selector');
  }
})