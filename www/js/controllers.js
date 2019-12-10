//
angular.module('andes.controllers', [])
.controller('EntregaCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  $rootScope.enInicio = 0;
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
  $scope.modoEscaner = 'leer';
  $scope.enableOp = true;
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = true;
      $scope.inventory = [];
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = true;
    $scope.inventory = [];
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
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
    if ($scope.modoEscaner == "leer") {
      $rootScope.barra = document.getElementById('textbox_barra').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.producto.php", { barra: $rootScope.barra }, function(data) {
        $rootScope.hideload();
        $rootScope.barra = "";
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
            qty: (isNaN($rootScope.custom_qty) ? 1 : parseInt($rootScope.custom_qty))
          });
        } 
        
        $rootScope.custom_qty=1;
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_barra').focus();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_barra').focus();
      });

    }

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.receptores = [];
  $scope.bodegas = [];


  $ionicModal.fromTemplateUrl('templates/finish_salida.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
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
    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Anular entrega?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('textbox_barra').focus();
})
.controller('ValeCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  $rootScope.enInicio = 0;
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
  $scope.modoEscaner = 'leer';
  $scope.enableOp = true;
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = true;
      $scope.inventory = [];
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = true;
    $scope.inventory = [];
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.inventory = [];
  }
  $scope.borrar = function (IdArticulo) {
    $rootScope.confirmar('Desea reiniciar el artículo: '+IdArticulo+'?', function() {
      $rootScope.showload();

      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }

      $http.post(app.rest+"/locations/"+$scope.barra+"/reset",{
        product_code: IdArticulo
      }).then((data) => {
        $rootScope.hideload();
        if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
        $rootScope.custom_qty=1;
        $scope.inventory = data.data.inventory;
        $scope.$broadcast('scroll.resize');
       
      },(err) => {
        $rootScope.hideload();
        if (window.cordova) { navigator.notification.beep(1); }
        $rootScope.err(err.data.error, function() {
          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
        });
      });

    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $rootScope.barra = document.getElementById('textbox_consumo').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=VC", { barra: $rootScope.barra }, function(data) {
        $rootScope.hideload();
        $rootScope.barra = "";
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
            qty: (isNaN($rootScope.custom_qty) ? 1 : parseInt($rootScope.custom_qty))
          });
        } 
        
        $rootScope.custom_qty=1;
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_consumo').focus();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_consumo').focus();
      });

    }

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.receptores = [];
  $scope.bodegas = [];


  $ionicModal.fromTemplateUrl('templates/finish_salida.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
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
    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Anular captura del vale de consumo?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('textbox_consumo').focus();
})
.controller('MakeloteCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  $rootScope.enInicio = 0;
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
  $scope.modoEscaner = 'leer';
  $scope.enableOp = true;
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = true;
      $scope.inventory = [];
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = true;
    $scope.inventory = [];
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.inventory = [];
  }
  $scope.borrar = function (IdArticulo) {

  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $rootScope.barra = document.getElementById('textbox_ott').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=Pieza", { barra: $rootScope.barra }, function(data) {
        $rootScope.hideload();
        $rootScope.barra = "";
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
            qty: (isNaN($rootScope.custom_qty) ? 1 : parseInt($rootScope.custom_qty))
          });
        } 
        
        $rootScope.custom_qty=1;
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_ott').focus();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_ott').focus();
      });

    }

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.receptores = [];
  $scope.bodegas = [];


  $ionicModal.fromTemplateUrl('templates/finish_salida.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
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
    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Anular armado del lote?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('textbox_ott').focus();
})
.controller('MainCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicModal, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate, $ionicHistory) {

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.inicio = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
    $ionicSideMenuDelegate.toggleLeft();
  };
})
.controller('SelectorCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicPopup, $ionicModal, $rootScope, $location, $ionicLoading, $ionicHistory) {

  $scope.modalConfiguracion = null;
  $rootScope.enInicio = 1;

  $scope.permiso_bodega_crear = true;
  $scope.permiso_bodega_vconsumo = true;
  $scope.permiso_prod_lotes = true;
  $scope.permiso_prod_traslado = true;
  $scope.permiso_prod_consulta = true;
  $scope.scanner = "";

  $ionicModal.fromTemplateUrl('templates/config.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfiguracion = modal;
  });

  $scope.$on('scanner', function(event, args) {
    $rootScope.usercode = document.getElementById('md5login').value;
    if ($scope.scanner == "login") {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.login.php", { credential: $rootScope.usercode }, function(data) {
        $rootScope.usercode = "";
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else { 
          $rootScope.nombre = data.name;
          $rootScope.id = data.id;
          $scope.modalConfiguracion.hide();
        }
        $rootScope.$apply();       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.usercode = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
      });
    }

  });
  
  $scope.start = function(x) {
    if (localStorage.getItem('user') == null) {
      setTimeout(function() { 
        $scope.scanner = "login";
        $scope.modalConfiguracion.show();
      },500);
    } 
  }
  
  $scope.start();


  $scope.ENTREGA = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.entrega');
  }
  $scope.VALE_CONSUMO = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.valeconsumo'); 
  }

  $scope.GENERAR_LOTES = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.makelote');
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
String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}
function miles(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}