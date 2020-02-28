angular.module('andes.controllers').controller('EntregalibreCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.$on('$destroy', deregisterFirst);

  $scope.warehouse = $stateParams.warehouse;
  $scope.popCloseable = null;
  $rootScope.modoEscaner = 'leer';
  $scope.empresa = '';
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.modoEscaner = 'leer';
      $scope.inventory = [];
      $scope.receptor = "";
      $scope.empresa = '';
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.modoEscaner = 'leer';
    $scope.inventory = [];
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $rootScope.modoEscaner = 'leer';
    $scope.empresa = '';
    $scope.inventory = [];
  }
  $scope.borrar = function (IdArticulo) {
    $rootScope.confirmar('Desea quitar el artículo: '+IdArticulo+'?', function() {
      for (var i = 0; i < $scope.inventory.length; i++) {
        if ($scope.inventory[i].itemcode == IdArticulo) {
          $scope.inventory.splice(i,1);
        }
      }
    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.producto.php", { barra:args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }

        var found = 0;
        for (var i = 0; i < $scope.inventory.length; i++) {
          if ($scope.inventory[i].itemcode == data.ItemCode) {
            found = 1;
            $scope.inventory[i].qty += parseInt($rootScope.custom_qty);
            break;
          }
        }

        if (found == 0) {
          $scope.inventory.push({
            itemcode: data.ItemCode,
            itemname: data.ItemName,
            eq: data.eq,
            qty: (isNaN($rootScope.custom_qty) ? 1 : parseInt($rootScope.custom_qty))
          });
        } 
        
        $rootScope.custom_qty=1;
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.$apply();
        $rootScope.err(err.error);
      });

    }

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.bodeganame = "";
  $scope.empresa = '';
  $scope.receptores = [];
  $scope.bodegas = [];


  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
  }
  $scope.finishConteo = function() {
    if ($scope.inventory.length == 0) {
      $rootScope.err("Salida vacia, revise nuevamente");
    }
    else {
      $scope.receptor = "";
      $scope.bodega = "";
      $scope.receptores = [];
      $scope.empresa = "";
      $scope.bodegas = [];
      $rootScope.showload();
      $ionicModal.fromTemplateUrl('templates/modal_entregalibre.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalSalida = modal;
        $scope.modalSalida.show();
      });
      jQuery.get(app.rest+"ajax.mobile.data.php&a=employee", function(data) {
        $scope.receptores = data;
      },"json");
      jQuery.get(app.rest+"ajax.mobile.data.php&a=whs", function(data) {
        $rootScope.hideload();
        $scope.bodegas = data;        
      },"json");
    }
  }
  $scope.setreceptor = function(x) { $scope.receptor = x; }
  $scope.setbodega = function(x,n) { $scope.bodega = x; $scope.bodeganame = n; }
  $scope.setempresa = function(x) { $scope.empresa = x; }
  $scope.confirmada = function() {  
    if ($scope.receptor == "") {
      $rootScope.err("Indique quien retira");
      return;
    }
    if ($scope.empresa == "") {
      $rootScope.err("Indique empresa");
      return;
    }
    if ($scope.bodega == "") {
      $rootScope.err("Indique bodega");
      return;
    }
    $rootScope.confirmar("Esta seguro?", function() {

      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=SendEntrega", {
        bodega: $scope.bodega,
        bodeganame: $scope.bodeganame,
        receptor: $scope.receptor,
        empresa: $scope.empresa,
        items: $scope.inventory, 
        autor: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else {
          $rootScope.ok(data.msg);
          $scope.inventory = [];
          $scope.modalSalida.hide();
        }        
      },"json");

    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Volver al inicio?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });
  }

})