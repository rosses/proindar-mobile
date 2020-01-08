angular.module('andes.controllers').controller('SelectorCtrl', 
 function($scope, $state, $localStorage, $timeout, $interval, $ionicPopup, $ionicModal, $rootScope, $location, $ionicLoading, $ionicHistory) {

  $scope.modalConfiguracion = null;
  $rootScope.enInicio = 1;

  $scope.perm = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
  $scope.modoEscaner = '';

  $ionicModal.fromTemplateUrl('templates/config.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfiguracion = modal;
  });

  $scope.$on('scanner', function(event, args) {
    console.log('selectorCtrl::scanner', args);
    if ($scope.modoEscaner == "login") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.login.php", { credential: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else { 
          $rootScope.nombre = data.name;
          $rootScope.id = data.id;
          localStorage.setItem('user', data.id);
          for (var i = 0; i < data.perm.length; i++) {
            $scope.perm[parseInt(data.perm[i].perm_id)] = true;
          }
          $scope.modoEscaner = ''; 
          $scope.modalConfiguracion.hide();
        }
        $rootScope.$apply();       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.$apply();
        $rootScope.err(err.error);
      });
    }

  });
  
  $scope.start = function(x) {
    setTimeout(function() {
      $scope.modoEscaner = 'login';
      $scope.modalConfiguracion.show();
    },500);
  }
  
  $scope.start();

  $scope.ENTREGA = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.entregalibre');
  }
  $scope.VALE_CONSUMO = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.valeconsumo'); 
  }

  $scope.RECEPCIONAR_OT = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.receiveot');
  };

  $scope.CAMBIAR_ETAPA = function(step) {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.cambiar', {step: step });
  };

  $scope.INICIAR = function(step) {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.asignar', { step: step });
  };

  $scope.TERMINAR = function(step) {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.terminar', { step: step });
  };
  $scope.MOVER_PIEZA = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.mover');
  };

  

  $scope.STOCK = function() {
    $rootScope.showload();
    jQuery.post(app.rest+"/conteo.php?op=puedeStock", { 
      grupo: $scope.grupo
    }, function(data) {
      $rootScope.hideload();
      if (data.res == "OK") {
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $state.go('main.stock');
      }
      else {
        $rootScope.err(data.msg);
      }
    });
  }
})