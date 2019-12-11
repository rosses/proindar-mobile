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
        $scope.bodegas = data;
        $scope.modalSalida.show();
      },"json");
    }
  }
  $scope.setreceptor = function(x) { $scope.receptor = x; }
  $scope.setbodega = function(x) { $scope.bodega = x; }
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
      jQuery.post(app.rest+"ajax.mobile.data.php&a=SendEntrega", {
        bodega: $scope.bodega,
        receptor: $scope.receptor,
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
  $scope.enableOp = false;
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
      $scope.enableOp = false;
      $scope.vale = null;
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.vale = null;
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
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

        $scope.enableOp = true;
        $scope.vale = data;

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
  $scope.setreceptor = function(x) { $scope.receptor = x; }
  $scope.setbodega = function(x) { $scope.bodega = x; }
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
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
        autor: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else {
          $rootScope.ok(data.msg);
          $scope.vale = null;
          $scope.enableOp = false;
          $scope.modalSalida.hide();
        }        
      },"json");


    });
  };
  $scope.cancelarValeConsumo = function() {
    $rootScope.confirmar("Anular captura del vale de consumo?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });
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
  $scope.barra = '';
  $scope.pieza = '';
  $scope.packet = [];
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.ot = null;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.barra = '';
      $scope.pieza = '';
      $scope.packet = [];
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.ot = null;
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.pieza = '';
    $scope.packet = [];
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.ot = null;
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.pieza = '';
    $scope.packet = [];
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.ot = null;
  }
  $scope.borrar = function (internalcode) {
    $rootScope.confirmar('Quitar pieza?', function() {
      for (var i = 0; i < $scope.packet.length; i++) {
        if ($scope.packet[i].internalcode == internalcode) {
          $scope.packet.splice(i,1);
          break;
        }
      }
    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $scope.barra = document.getElementById('textbox_ott').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=ot", { barra: $scope.barra }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        $scope.ot = data;
        $scope.enableOp = true;
        $scope.packet = [];
        $scope.modoEscaner = "lotear";
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_box').focus();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_ott').focus();
      });

    }
    else if ($scope.modoEscaner == "lotear") {

      $scope.pieza = document.getElementById('textbox_box').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=pieza&to=packet", { barra: $scope.pieza }, function(data) {
        $rootScope.hideload();
        $scope.pieza = "";
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }

        var add = 1;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe en este lote");
            add = 0;
            break;
          }
        }

        if (add==1) {
          $scope.packet.push({
            mark: data.mark,
            dimtype: data.dimtype,
            kg: parseFloat(data.totalkg),
            internalcode: data.internalcode
          });
        }

        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_box').focus();


       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $scope.pieza = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_box').focus();
      });

    } 

  });


  $scope.finishLote = function() {

    if ($scope.packet.length == 0) {
      $rootScope.err("Lote vacio, revise nuevamente");
    }
    else {
      $rootScope.confirmar("Se generará un lote y se moveran las piezas a la próxima etapa. Desea continuar?", function() {
        $rootScope.showload();
        jQuery.post(app.rest+"ajax.mobile.data.php&a=crearLote", { 
          ot: $scope.ot.id,
          packet: $scope.packet,
          autor: localStorage.getItem('user')
        }, function(data) {
          $rootScope.hideload();
  
          if (data.error) {
            $rootScope.err(data.error);
            return;
          }

          $scope.barra = '';
          $scope.pieza = '';
          $scope.packet = [];
          $scope.modoEscaner = 'leer';
          $scope.enableOp = false;
          $scope.ot = null;

          $rootScope.ok(data.msg);

          $scope.$broadcast('scroll.resize');
          $rootScope.$apply();
          document.getElementById('textbox_ott').focus();
          
        },"json");
      });
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
  $scope.cancelarLote = function() {
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
.controller('MoverCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
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

  $scope.barra = '';
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.packet = [];
  $scope.ejecutor = "";

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.packet = [];
      $scope.ejecutor = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.packet = [];
    $scope.ejecutor = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.packet = [];
    $scope.ejecutor = "";
  }
  $scope.borrar = function (IdArticulo) {

  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "moving") {
      $scope.barra = document.getElementById('textbox_moveme').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=pieza", { barra: $scope.barra }, function(data) {
        $rootScope.hideload();

        $scope.barra = "";
        $rootScope.$apply();
        
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        
        var found = 0;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya leida en esta gestión");
            found = 1;
            break;
          }
        }

        if (found == 1) {
          return;
        }
        
        if (found == 0) {
          if (data.current_step != $scope.gol) {
            $rootScope.err("Pieza no se encuentra en la etapa indicada. Se encuentra en "+data.stepName);
            return;
          }

          $scope.packet.push({
            internalcode: data.internalcode,
            mark: data.mark,
            dimtype: data.dimtype,
            ok: true
          });
        } 
        
        
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_moveme').focus();

      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_moveme').focus();
      });

    }

  });

  $scope.MOVER = function(gol) {
      $scope.enableOp = true;
      $scope.modoEscaner = "moving";
      $scope.flowforward = true;
      $scope.gol = gol;
  }

  $scope.modalSalida = null;
  $scope.ejecutor = "";
  $scope.ejecutores = [];

  $ionicModal.fromTemplateUrl('templates/finish_move.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
  }
  $scope.finishMover = function() {
    if ($scope.packet.length == 0) {
      $rootScope.err("movimiento vacio, revise nuevamente");
    }
    else {
      $scope.ejecutor = "";
      $scope.ejecutores = [];
      $rootScope.showload();
      jQuery.get(app.rest+"ajax.mobile.data.php&a=employee", function(data) {
        $scope.ejecutores = data;
        $rootScope.hideload();
        $scope.modalSalida.show();
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
      //$scope.gol = > current_step

    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Anular proceso?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('textbox_moveme').focus();
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
          localStorage.setItem('user', data.id);
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
    setTimeout(function() {
      $scope.scanner = "login";
      $scope.modalConfiguracion.show();
    },500);
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