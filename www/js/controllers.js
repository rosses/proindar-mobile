//
angular.module('andes.controllers', [])
.controller('ConteoCtrl', function($scope, $state, $rootScope, $localStorage, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
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
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.inventory = [];
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.inventory = [];
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
    
    if (args.hasOwnProperty("data") && args.data.success == true) {

      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }

      if ($scope.modoEscaner == 'leer') {
      
        $rootScope.showload();
        $http.get(app.rest+"/locations/"+args.data.data).then((data) => {
          $rootScope.hideload();
          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          $rootScope.custom_qty=1;
          $scope.conteo = 1; /*data.countings.length;*/
          $scope.barra = args.data.data;
          $scope.enableOp = true;
          $scope.modoEscaner = 'agregar';
          $scope.inventory = data.data.inventory;
          $scope.$broadcast('scroll.resize');
         
        },(err) => {
          $rootScope.hideload();
          if (window.cordova) { navigator.notification.beep(1); }
          $rootScope.err(err.data.error, function() {
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          });
        });

      }

      else if ($scope.modoEscaner == 'agregar') {

        $rootScope.showload();
        $http.post(app.rest+"/locations/"+$scope.barra+"/add",{
          product_quantity: $rootScope.custom_qty,
          product_code: args.data.data
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
      }
    }
  });

  $scope.finishConteo = function() {
    if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }

    $rootScope.showload();
    $http.post(app.rest+"/locations/"+$scope.barra+"/close",{}).then((data) => {
      $rootScope.hideload();
      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }

      $rootScope.ok("Muchas gracias");       
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
      $rootScope.custom_qty=1;
      $scope.$broadcast('scroll.resize');
     
    },(err) => {
      $rootScope.hideload();
      if (window.cordova) { navigator.notification.beep(1); }
      $rootScope.err(err.data.error, function() {
        if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
      });
    });


  }
  $scope.cancelarConteo = function() {
    /*
    if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }
    $rootScope.confirmar("Continuar despues?", function() {
        
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');

      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    }, function() {
      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    });
    */
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
  }
})
.controller('UbicacionCtrl', function($scope, $state, $rootScope, $localStorage, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
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
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.inventory = [];
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.inventory = [];
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.inventory = [];
  }
  $scope.borrar = function (IdArticulo) {
    $rootScope.confirmar('Desea quitar el articulo: '+IdArticulo+'?', function() {
      $rootScope.showload();

      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }

      $http.post(app.rest+"/product-location/remove",{
        code: IdArticulo,
        location: $scope.barra
      }).then((data) => {
        $rootScope.hideload();
        if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
        for (var i = 0; i < $scope.inventory.length;i++) {
        	if ($scope.inventory[i].code == IdArticulo) {
        		$scope.inventory.splice(i,1);
        		break;
        	}
        }
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
    
    if (args.hasOwnProperty("data") && args.data.success == true) {

      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }

      if ($scope.modoEscaner == 'leer') {
      
        $rootScope.showload();
        $http.get(app.rest+"/locations/"+args.data.data+"?query=1").then((data) => {
          $rootScope.hideload();
          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          $scope.conteo = 1;
          $scope.barra = args.data.data;
          $scope.enableOp = true;
          $scope.modoEscaner = 'agregar';
          $scope.inventory = []; /*data.data.inventory;*/
          $scope.$broadcast('scroll.resize');
         
        },(err) => {
          $rootScope.hideload();
          if (window.cordova) { navigator.notification.beep(1); }
          $rootScope.err(err.data.error, function() {
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          });
        });

      }

      else if ($scope.modoEscaner == 'agregar') {

        $rootScope.showload();
        $http.post(app.rest+"/product-location/add?query=1",{
          location: $scope.barra,
          code: args.data.data
        }).then((data) => {
          $rootScope.hideload();
            if (data.data.description) {
	    	  	var aa = 1;
		        for (var i = 0; i < $scope.inventory.length;i++) {
		        	if ($scope.inventory[i].code == args.data.data) {
		        		aa = 0;
		        		break;
		        	}
		        }
		        if (aa == 1) {
					$scope.inventory.push({
						code: args.data.data,
						description: data.data.description
					});
		        }
            }

          if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          $scope.$broadcast('scroll.resize');
         
        },(err) => {
          $rootScope.hideload();
          if (window.cordova) { navigator.notification.beep(1); }
          $rootScope.err(err.data.error, function() {
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
          });
        });
      }
    }
  });

 
  $scope.cancelarConteo = function() {
    /*
    if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }
    $rootScope.confirmar("Continuar despues?", function() {
        
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');

      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    }, function() {
      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    });
    */
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
  }
})
.controller('ProductoCtrl', function($scope, $state, $rootScope, $localStorage, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory) {
  $rootScope.enInicio = 0;
  $scope.popCloseable = null;
  $scope.barra = '';
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.inventory = [];
  $scope.info = {};
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.locations = [];
      $scope.info = {};
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.locations = [];
    $scope.info = {};
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.locations = [];
    $scope.info = {};
  }

  $scope.cancelarConteo = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
  }
 
  $scope.$on('scanner', function(event, args) {
    
    if (args.hasOwnProperty("data") && args.data.success == true) {

      if (window.cordova) { window.cordova.plugins.honeywell.disableTrigger(() => console.info('trigger disabled')); }
      
      if ($scope.modoEscaner == 'leer') {
          $rootScope.showload();
          jQuery.get(app.rest+"/product/"+args.data.data + "?addStock=1", function(data) {
            
            $scope.enableOp = true;
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            $scope.info = data;

            jQuery.get(app.rest+"/product-location/"+data.code, function(data2) {
              $rootScope.hideload(); 
              $scope.locations = data2;
              $scope.$broadcast('scroll.resize');
            },"json"); 
            
          },"json").fail(function(err) {
            $rootScope.hideload(); 
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            $rootScope.err(err.responseJSON.error);
          }); 
      }

      if ($scope.modoEscaner == 'agrega') {
          $rootScope.showload();

          $scope.modoEscaner = "leer";
          $("body").removeClass("modal-open");
          $scope.popCloseable.close();

          jQuery.post(app.rest+"/product-location/add", {
            code: $scope.info.code,
            location: args.data.data
          }, function(data) {
            
            $rootScope.hideload(); 
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            $scope.locations = data;

          },"json").fail(function(err) {
            $rootScope.hideload(); 
            if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
            $rootScope.err(err.responseJSON.error);
          }); 
      }
    }
  });

  $scope.BORRAR_UBICACION = function(c) {
    $rootScope.confirmar('¿Seguro?', function() {
      $rootScope.showload();

      $scope.modoEscaner = "leer";

      jQuery.post(app.rest+"/product-location/remove", {
        code: $scope.info.code,
        location: c
      }, function(data) {

      $rootScope.hideload(); 
      if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
      $scope.locations = data;

      },"json").fail(function(err) {
        $rootScope.hideload(); 
        if (window.cordova) { window.cordova.plugins.honeywell.enableTrigger(() => console.info('trigger enabled')); }
        $rootScope.err(err.responseJSON.error);
      }); 
    });
  }
  $scope.AGREGAR_UBICACION = function() {
    $scope.modoEscaner = "agrega";
    $scope.popCloseable = $ionicPopup.alert({
     title: 'ESCANEA CODIGO',
     template: 'ESCANEA CODIGO DE UBICACION',
     buttons: [{
      text: 'Cancelar',
      type: 'button-assertive'
      }]
    });

    $scope.popCloseable.then(function(res) {
      $scope.modoEscaner = "leer";
      $("body").removeClass("modal-open");
      $scope.popCloseable.close();
    }); 
  } 
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

  $scope.cambiarGrupo = function() {
    $ionicSideMenuDelegate.toggleLeft();
    $rootScope.$broadcast('cambiarGrupoBroadcast', null);
  }
})
.controller('SelectorCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicPopup, $ionicModal, $rootScope, $location, $ionicLoading, $ionicHistory) {

  $scope.modalConfiguracion = null;
  $rootScope.enInicio = 1;
  $ionicModal.fromTemplateUrl('templates/config.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfiguracion = modal;
  });
  /*
  $scope.start = function(x) {
    if (localStorage.getItem('ocip') == null) {
      setTimeout(function() { 
        $scope.modalConfiguracion.show();
      },500);
    } 
  }
  */
  /*$scope.start();*/
  $scope.selg = "";
  $scope.grupo = localStorage.getItem('ocip');

  $scope.setGrupo = function(i) {
    $scope.selg = "grupo"+i;
  }
  $scope.confirmGrupo = function() {
    $rootScope.confirmar('¿Seguro?', function() {
      localStorage.setItem('ocip', $scope.selg);
      $scope.grupo = localStorage.getItem('ocip');
      $scope.modalConfiguracion.hide();
      $scope.start();
    });
    
  }
  $scope.data = { password: "" };

  $scope.$on('cambiarGrupoBroadcast', function(event, message) {
    var myPopup = $ionicPopup.show({
      template: '<input type="password" ng-model="data.password" placeholder="ingresa la clave">',
      cssClass: 'pass-custom-popup',
      title: 'Que usaba Linus',
      subTitle: 'de la serie Darvin del 101',
      scope: $scope,
      buttons: [
        { text: 'Cancelar' },
        {
          text: '<b>Aceptar</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.password) {
              $rootScope.err("No autorizado");
            } else {
              return $scope.data.password;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      console.log('Tapped!', res);
      if (res == "pañito") {
        localStorage.removeItem('ocip');
        $scope.start();
      }
      else {
        $rootScope.err("No autorizado");
      }
    });
  });
  $scope.BVN = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.bvn');
  }

  $scope.BPM = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.bpm');
  }

  $scope.CONTEO = function(warehouse) {
    $rootScope.err('Opción bloqueada');
    /*
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.conteo');
    */
  }
  $scope.INGRESO_UBICACION = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.ubicacion'); 
  }

  $scope.CONSULTAR_PRODUCTO = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $ionicHistory.clearCache();
    $state.go('main.producto'); 
  }

  $scope.BPMUbicacion = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.bpmubicacion');
  }

  $scope.BVNUbicacion = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.bvnubicacion');
  }
  $scope.BSRUbicacion = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.bsrubicacion');
  }

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