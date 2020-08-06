angular.module('andes.controllers').controller('MoverpkgCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );  
  $scope.$on('$destroy', deregisterFirst);
  $scope.modalSalida = null;
  $scope.activeTab = 'panel';
  $rootScope.modoEscaner = 'leer'; 
  $scope.packings = [];
  $scope.drivers = [];
  $scope.plates = [];
  $scope.moving_to_doc = [];
  $scope.moving_to_wh = [];
  $scope.activePackings = [];
  $scope.driver = "";
  $scope.plate = "";

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.activeTab = '';
    $scope.packings = [];
    $scope.drivers = [];
    $scope.plates = [];
    $scope.moving_to_doc = [];
    $scope.moving_to_wh = [];
    $scope.driver = "";
    $scope.plate = "";
    $scope.activePackings = [];
    $rootScope.modoEscaner = 'leer'; 
  }); 


  $scope.changeTab = function(a) {
    $scope.activeTab = a;
  }
  
  $scope.borrar = function(i) {
    $scope.packings.splice(i,1);
    $scope.activePackings.splice(i,1);
  }
  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=movingpacking", { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) { 
          $rootScope.err(data.error); 
          playerror();
          return; 
        }
        
        if ($scope.activePackings.indexOf(data.pkg.name) > -1) {
          $rootScope.err("Packing ya cargado en este movimiento"); 
          playerror();
          return;  
        }

        $scope.packings.push(data);
        $scope.activePackings.push(data.pkg.name);
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply(); 
      },"json");
    }  
  });

  $scope.prepareMoving = function() {
    $scope.moving_to_doc = $scope.packings.filter(({ destination }) => destination == 1).map(({ pkg }) => pkg.name);
    $scope.moving_to_wh = $scope.packings.filter(({ destination }) => destination == 2).map(({ pkg }) => pkg.name);
    if ($scope.moving_to_wh.length + $scope.moving_to_doc.length == 0) {
      $rootScope.err("No estás moviendo nada");
      return;
    }
    if ($scope.moving_to_doc.length > 0) {
      $ionicModal.fromTemplateUrl('templates/modal_camion.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalSalida = modal;
        $scope.modalSalida.show();
      });
      $rootScope.showload();
      jQuery.get(app.rest+"ajax.mobile.data.php&a=drivers", function(data) {
        $scope.drivers = data.drivers;
        $scope.plates = data.plates;
        $rootScope.hideload();
      },"json");

    }
    else {
      $rootScope.confirmar("Va a mover los packings, está seguro?", function() {
        $scope.confirmada();
      });
    }
  }
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
  }
  $scope.setdriver = function(z) {
    $scope.driver = z;
  }
  $scope.setplate = function(z) {
    $scope.plate = z;
  }
  $scope.confirmada = function() {

    if ($scope.moving_to_doc.length > 0 && $scope.driver == "")  {
      $rootScope.err("Debe indicar conductor");
      return;
    }
    if ($scope.moving_to_doc.length > 0 && $scope.plate == "")  {
      $rootScope.err("Debe indicar patente");
      return;
    }
    if ($scope.modalSalida) {
      $scope.modalSalida.hide();
    }
    $rootScope.showload();
    jQuery.post(app.rest+"ajax.mobile.data.php&a=sendpacking", { 
      docs: $scope.moving_to_doc,
      whs: $scope.moving_to_wh,
      by: localStorage.getItem('user'), 
      chofer: $scope.driver,
      patente: $scope.plate
    }, function(data) {
      $rootScope.hideload();
      if (data.error) {
        $rootScope.err(data.error);
        return;
      }
      $rootScope.ok(data.msg);
      
      $scope.packings = [];
      $scope.drivers = [];
      $scope.plates = [];
      $scope.activePackings = [];
      $scope.driver = "";
      $scope.plate = "";
      $rootScope.modoEscaner = "leer";
      $scope.activeTab = 'panel';
      $scope.$broadcast('scroll.resize');
      $rootScope.$apply();
    },"json"); 
    
  };
  $scope.cancelar = function() {
    if ($scope.packings.length > 0) { $rootScope.confirmar("Cancelar?", function() { $scope.chao(); }); }
    else { $scope.chao(); }
  }
  $scope.chao = function() {
    $ionicHistory.nextViewOptions({ historyRoot: true }); 
    $state.go('main.selector');
  }
})