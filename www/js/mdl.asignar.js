angular.module('andes.controllers').controller('AsignarCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.modalSteper = null;
  $scope.$on('$destroy', deregisterFirst);

  $scope.stepName = '';
  $scope.modoEscaner = 'leer';
  $scope.packet = [];
  $scope.ejecutor = "";

  //if ($stateParams.step == "7") { $scope.stepName = "CALIDAD"; }
  $scope.setStep = function(sx) {
    $stateParams.step = sx;
    if ($stateParams.step == "3") { $scope.stepName = "CORTE"; }
    if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; }
    if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; }
    if ($stateParams.step == "6") { $scope.stepName = "TERMINACIÓN"; }
  }

  $scope.etapaOK = function() {
    $scope.modalSteper.hide();
  };

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.modoEscaner = 'leer';
      $scope.packet = [];
      $scope.ejecutor = "";
    } 
    //$scope.setStep(3);
  });

  if ($stateParams.step == "3") { $scope.stepName = "CORTE"; }
  if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; }
  if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; }
  if ($stateParams.step == "6") { $scope.stepName = "TERMINACIÓN"; }


  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.modoEscaner = 'leer';
    $scope.packet = [];
    $scope.ejecutor = ""; 
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.modoEscaner = 'leer';
    $scope.packet = [];
    $scope.ejecutor = "";
  }
  $scope.borrar = function (IdPieza) {
    for (var i = 0; i < $scope.packet.length; i++) {
      if ($scope.packet[i].internalcode == IdPieza) {
        $scope.packet.splice(i, 1);
        break;
      }
    }
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=moving", { 
        barra: args.barcode, 
        autor: localStorage.getItem('user'),
        to: $stateParams.step,
        action: "inicio"
      }, function(data) {
        $rootScope.hideload();
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        if ($scope.packet.length > 0 && $scope.packet[0].OT!=data.OT) {
          $rootScope.err("Pieza no corresponde a OT en trabajo");
          return;
        }
        var found = 0;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe en esta gestión");
            found = 1;
            break;
          }
        }
        if (found == 1) {
          return;
        }
        
        if (found == 0) {
          data.dimtype = data.dimtype.replace("peldano","Peldaño");
          $scope.packet.push({
            internalcode: data.internalcode,
            mark: data.mark,
            dimtype: data.dimtype.charAt(0).toUpperCase() + data.dimtype.slice(1),
            cardname: data.cardname,
            OT: data.OT,
            totalkg: parseFloat(data.totalkg)
          });
        } 
        
        
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
      },"json");

    }

  });

  $scope.modalInicio = null;
  $scope.ejecutor = "";
  $scope.ejecutores = [];

  $ionicModal.fromTemplateUrl('templates/modal_emp_inicio.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalInicio = modal;
  });
  $scope.closeSalida = function() {
    $scope.modalInicio.hide();
  }
  $scope.prepareInicio = function() {
    if ($scope.packet.length == 0) {
      $rootScope.err("movimiento vacio");
    }
    else {
      $scope.ejecutor = "";
      $scope.ejecutores = [];
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=employee", {step: $stateParams.step}, function(data) {
        $scope.ejecutores = data;
        $rootScope.hideload();
        $scope.modalInicio.show();
      },"json");
    }
  }

  $scope.setejecutor = function(x) { $scope.ejecutor = x; }
  $scope.confirmada = function() {
    if ($scope.ejecutor == "") {
      $rootScope.err("Indique ejecutor de tarea");
      return;
    }  
    $rootScope.confirmar("Esta seguro?", function() {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=trx_asignar", {
        ejecutor: $scope.ejecutor,
        items: $scope.packet, 
        autor: localStorage.getItem('user'),
        to: $stateParams.step, 
        action: "inicio"
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else {
          $scope.packet = [];
          $scope.modalInicio.hide();
          $rootScope.ok(data.msg);
        }        
      },"json");

    });
  };
  $scope.cancelarInicio = function() {
    $rootScope.confirmar("Salir?", function() {
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
})