angular.module('andes.controllers').controller('ValeCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {

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
  $rootScope.barra = '';
  $rootScope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.barra = '';
      $rootScope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.vale = null;
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $rootScope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.vale = null;
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $rootScope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.vale = null;
    $scope.receptor = "";
    $scope.bodega = "";
  }
  $scope.formatQty = function(x) {
    return parseFloat( x ) || 0;
  }
  $scope.borrar = function (IdArticulo) {
    $rootScope.confirmar('Desea reiniciar el artículo: '+IdArticulo+'?', function() {
      $rootScope.showload();
    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($rootScope.modoEscaner == "leer") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=VC", { barra: args.barcode }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }

        for (var i = 0; i < data.items.length; i++) {
          data.items[i].parcial = data.items[i].pending;
        }
        $scope.enableOp = true;
        $scope.vale = data;

        $rootScope.modoEscaner = "producto";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
       
      },"json").fail(function(err) {
        $rootScope.modoEscaner = "leer";
        $rootScope.hideload(); 
        $rootScope.$apply();
        $rootScope.err(err.error);
      });
    }
    else if ($rootScope.modoEscaner == "persona") {
      var str = args.barcode.split('|');
      if (str.length == 3) {
        var eid = str[1];
        for (var x = 0; x < $scope.receptores.length; x++) {
          if ($scope.receptores[x].id == eid) {
            $scope.receptor = eid;
            $scope.confirmada();
            break;
          }
        }
      } 
      else {
        $rootScope.err("Credencial de colaborador no existe");
        playerror();
      }
    } 

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.receptores = [];
  $scope.bodegas = [];


  $ionicModal.fromTemplateUrl('templates/modal_valeconsumo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
  $scope.setreceptor = function(x) { $scope.receptor = x; }
  $scope.setbodega = function(x) { $scope.bodega = x; }
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
    $rootScope.modoEscaner = "leer";
  }
  $scope.finishValeconsumo = function() {
    if ($scope.vale.items.length == 0) {
      $rootScope.err("Vale sin lineas");
    }
    else {
      var sumado = 0;
      for (var i = 0; i < $scope.vale.items.length; i++) {
        var parcial = parseFloat($scope.vale.items[i].parcial);
        sumado += parcial;
      }

      if (sumado <= 0) {
        $rootScope.err("Suma de cantidades parciales deben ser mayor a cero");
        return false;
      }
      $rootScope.modoEscaner = "persona";
      $scope.receptor = "";
      $scope.bodega = "";
      $scope.receptores = [];
      $scope.bodegas = [];
      $rootScope.showload();
      jQuery.get(app.rest+"ajax.mobile.data.php&a=employee", function(data) {
        $scope.receptores = data;
      },"json");
      jQuery.get(app.rest+"ajax.mobile.data.php&a=whs", function(data) {
        $rootScope.hideload();
        $scope.modalSalida.show();
        $scope.bodegas = data;
      },"json");


    }
  }
  $scope.confirmada = function() {
    if ($scope.bodega == "") {
      $rootScope.err("Indique bodega");
      return;
    }
    if ($scope.receptor == "") {
      $rootScope.err("Indique receptor de mercancias");
      return;
    }
    $rootScope.confirmar("Esta seguro?", function() {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=SendVC", {
        bodega: $scope.bodega,
        receptor: $scope.receptor,
        vale: $scope.vale, 
        autor: localStorage.getItem('user'),
        ot: $scope.vale.fullname
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
          return false;
        }
        else {
          $rootScope.ok(data.msg);
          $scope.vale = null;
          $scope.enableOp = false;
          $scope.modalSalida.hide();
          $rootScope.modoEscaner = 'leer';
        }        
      },"json").fail(function(Err){
          $rootScope.modoEscaner = 'leer';
          console.log(Err);
          $rootScope.err("Tiempo agotado, favor reintentar");
      });


    });
  };
  $scope.cancelarValeConsumo = function() {
    if ($scope.vale != null) {
      $rootScope.confirmar("Anular captura del vale de consumo?", function() {
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $state.go('main.selector');
      }, function() {
      });
    } else {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }

  }
  $scope.moveParcial = function(index,variation) {
    var p = parseFloat($scope.vale.items[index].parcial);
    var q = parseFloat($scope.vale.items[index].quantity);
    
    if (p+variation > q || p+variation < 0) {
      return false;
    }

    p += variation;
    $scope.vale.items[index].parcial = ""+(p)+"";
  } 

})
