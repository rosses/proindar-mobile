angular.module('andes.controllers').controller('CalidadCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.$on('$destroy', deregisterFirst);

  $scope.modalRechazo = null;
  $scope.activeRow = { code: '', index: null };
  $rootScope.modoEscaner = 'leer';
  $scope.rejects = [];

  //if ($stateParams.step == "7") { $scope.stepName = "CALIDAD"; }
  $scope.setStep = function(sx) {
    $stateParams.metodo = sx;
    //if ($stateParams.metodo == "allow") { $scope.stepName = "APROBAR"; }
    //if ($stateParams.metodo == "reject") { $scope.stepName = "RECHAZAR"; } 
  }

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (viewData.direction == 'back') {
      $scope.modalRechazo = null;
      $scope.activeRow = { code: '', index: null };
      $rootScope.modoEscaner = 'leer';
      $scope.rejects = [];
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.modalRechazo = null;
    $scope.activeRow = { code: '', index: null };
    $rootScope.modoEscaner = 'leer';
    $scope.rejects = [];
  }); 

  $scope.cancelar = function() {
    $scope.modalRechazo = null;
    $scope.activeRow = { code: '', index: null };
    $rootScope.modoEscaner = 'leer';
    $scope.rejects = [];
  }

  $scope.getSelected = function() {
    var t = 0;
    if ($scope.packing) {
      for (var i = 0; i < $scope.packing.pieces.length; i++) {
        if ($scope.packing.pieces[i].allowed != 0) {
          t++;
        }
      }
    }
    return t;
  } 
  $scope.marcarOkTodo = function() {
    if ($scope.packing) {
      for (var i = 0; i < $scope.packing.pieces.length; i++) {
        $scope.packing.pieces[i].allowed = 1;
      }
    }
  };
  $scope.intercalateCalidad = function(idx) {
    if ($scope.packing.pieces[idx].allowed == 0) {
      $scope.packing.pieces[idx].allowed = 1;
    }
    else if ($scope.packing.pieces[idx].allowed == 1) {
      $scope.packing.pieces[idx].allowed = -1;
    }
    else if ($scope.packing.pieces[idx].allowed == -1) {
      $scope.packing.pieces[idx].allowed = 0;
    }
  }
  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=packing", { 
        barra: args.barcode, 
        autor: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          playerror();
          return;
        }
        $scope.packing = data;
        for (var i = 0; i < $scope.packing.pieces.length; i++) {
          $scope.packing.pieces[i].allowed = 0;
          $scope.packing.pieces[i].code = "";
          $scope.packing.pieces[i].flashme = 0;
        }
        $rootScope.modoEscaner = 'buscar';
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
      },"json");

    }
    else if ($rootScope.modoEscaner == "buscar") {
      var found = 0;
      for (var i = 0; i < $scope.packing.pieces.length ; i++) {
        //console.log($scope.packing.pieces[i].internalcode, args.barcode);
        if ($scope.packing.pieces[i].internalcode == args.barcode) {
          $scope.packing.pieces[i].flashme = 1;
          //console.log('flash '+i);
          setTimeout(function() {
            //$scope.packing.pieces[i].flashme = false;
            //console.log('unflash '+i);
          }, 1000);
          found = 1;
          //$scope.$broadcast('scroll.resize');
          $rootScope.$apply();
          break;
        } 
      }
      if (found == 0) {
        $rootScope.err("Pieza no encontrada en este packing");
        playerror();
      }
    }

  });

  $scope.rechazoCode = function(code, index) {
      $scope.activeRow.code = code;
      $scope.activeRow.index = index;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=rejects", { 
        
      }, function(data) {
        $scope.rejects = data;
        $rootScope.hideload();
        $scope.modalRechazo.show();
      },"json");
  };
  $scope.clickCode = function(code) {
    $scope.packing.pieces[$scope.activeRow.index].code = code;
    $scope.modalRechazo.hide();
  };

  $ionicModal.fromTemplateUrl('templates/modal_rechazos.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalRechazo = modal;
  }); 
  
  $scope.procesar = function() {
    var items = [];
    for (var i = 0;i < $scope.packing.pieces.length; i++) {
      if ($scope.packing.pieces[i].allowed != 0) {
        items.push({
          internalcode: $scope.packing.pieces[i].internalcode,
          allowed: $scope.packing.pieces[i].allowed,
          code: $scope.packing.pieces[i].code
        });
      }
    }
    if (items.length > 0) {
      $rootScope.confirmar("Procesar "+$scope.getSelected()+" de "+$scope.packing.pieces.length+" piezas?", function() { 
        $rootScope.showload();
        jQuery.post(app.rest+"ajax.mobile.data.php&a=calidad", {
          autor: localStorage.getItem('user'),
          items: items
        }, function(data) {
          $rootScope.hideload();
          if (data.error) {
            $rootScope.err(data.error);
          }
          else {
            $scope.packing = null;
            $rootScope.modoEscaner = 'leer';
            $rootScope.ok(data.msg);
          }        
        },"json");
      });
    }
    else {
      $rootScope.err("Nada que procesar");
    }
  };
  
  $scope.cancelar = function() {
    if ($scope.packing) {
      $rootScope.confirmar("Salir?", function() {
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $state.go('main.selector');
      }, function() {
      });
    }
    else {
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $state.go('main.selector');
    }
  }
})