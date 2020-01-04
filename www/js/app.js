app = {
  //rest:  "http://proindar.enlanube.cl/require/load.php?call="
  rest:  "http://proindar.test/require/load.php?call="
};

angular.module('andes', ['ionic', 'andes.controllers','ngStorage','peanuthub-custom-keyboard', 'plgn.ionic-segment'])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $timeout, $state, $localStorage, $ionicPopup, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    //localStorage.removeItem('user');
    $rootScope.id = "";
    $rootScope.nombre = "";
    $rootScope.usercode = "";
    if (!window.cordova) {
      $rootScope.usercode = ""; /* for demo porposes */
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.custom_qty = "1";
  $rootScope.calculator = function() {
    //$rootScope.$broadcast("calculatorCelebrity", { data: {success: true} });
  };

  $rootScope.showload = function(text) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><br /><span>'+(text ? text : '')+'</span>'
    }).then(function(){
    });
  };
  $rootScope.hideload = function(){
    $ionicLoading.hide().then(function(){
    });
  };
 
  $state.go("main.selector");
 

  $rootScope.err = function(msg, cb) {
     var alertPopup = $ionicPopup.alert({
       title: 'Error',
       template: (msg ? msg : 'Error al consultar el servicio. Intente más tarde'),
       buttons: [{
        text: 'Aceptar',
        type: 'button-assertive'
        }]
     });

     alertPopup.then(function(res) {
       $("body").removeClass("modal-open");
       if (cb) {
        cb();
       }
     });
  };
  $rootScope.ok = function(msg, title, callback, aceptarBtn) {
     var alertPopup = $ionicPopup.alert({
       title: (title ? title : 'Listo'),
       template: (msg ? msg : 'Operación realizada'),
       buttons: [{
        text: (aceptarBtn ? aceptarBtn : 'Aceptar'),
        type: 'button-assertive'
        }]
     });

     alertPopup.then(function(res) {
      $("body").removeClass("modal-open");
      alertPopup.close();
      if (callback) { 
        callback();
      }
     });

     if (callback) {
      return alertPopup;
     }
  };
  $rootScope.confirmar = function(msg, callback,no) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirmar',
     template: (msg ? msg : '¿Desea continuar?'),
     buttons: [
      { 
        text: 'No', 
        type: 'button-dark',
        onTap: function(e) { if (no) { $("body").removeClass("modal-open"); no(); } } 
      },
      {
        text: '<b>Aceptar</b>',
        type: 'button-assertive',
        onTap: function(e) {
          $("body").removeClass("modal-open");
          callback();
        }
      },
     ]
   });
  };

  $rootScope.forHumans = function  ( seconds ) {
      var levels = [
          [Math.floor(seconds / 31536000), 'años'],
          [Math.floor((seconds % 31536000) / 86400), 'dias'],
          [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hrs'],
          [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'mins'],
          [(((seconds % 31536000) % 86400) % 3600) % 60, 'segs'],
      ];
      var returntext = '';

      for (var i = 0, max = levels.length; i < max; i++) {
          if ( levels[i][0] === 0 ) continue;
          returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length-1): levels[i][1]);
      };
      return returntext.trim();
  }

 
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider, $peanuthubCustomKeyboardProvider) {

  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  $peanuthubCustomKeyboardProvider.addCustomKeyboard('CUSTOM_SKU', {
  keys: [
   { type: "CHAR_KEY", value: "1" },
   { type: "CHAR_KEY", value: "2", label: "" },
   { type: "CHAR_KEY", value: "3", label: "" },
   { type: "CHAR_KEY", value: "4" },
   { type: "CHAR_KEY", value: "5" },
   { type: "CHAR_KEY", value: "6" },
   { type: "CHAR_KEY", value: "7" },
   { type: "CHAR_KEY", value: "8" },
   { type: "CHAR_KEY", value: "9" },
   { type: "CHAR_KEY", value: "50" },
   { type: "CHAR_KEY", value: "0" },
   { type: "DELETE_KEY", icon: "ion-backspace-outline" }
  ]});

  $stateProvider

  .state('main', {
    url: '/main',
    abstract: true,
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })

  .state('main.selector', {
    url: '/selector',
    views: {
      'menuContent': {
        templateUrl: 'templates/selector.html',
        controller: 'SelectorCtrl'
      }
    }
  })
  .state('main.entrega', {
    url: '/entrega',
    views: {
      'menuContent': {
        templateUrl: 'templates/entrega.html',
        controller: 'EntregaCtrl'
      }
    },
    params: {
      warehouse: ''
    }
  })
  .state('main.valeconsumo', {
    url: '/valeconsumo',
    views: {
      'menuContent': {
        templateUrl: 'templates/valeconsumo.html',
        controller: 'ValeCtrl'
      }
    },
    params: {
      warehouse: ''
    }
  })
  .state('main.receiveot', {
    url: '/receiveot',
    views: {
      'menuContent': {
        templateUrl: 'templates/receiveot.html',
        controller: 'ReceiveotCtrl'
      }
    },
    params: {
      warehouse: ''
    }
  })
  .state('main.makeloteentrada', {
    url: '/makeloteentrada',
    views: {
      'menuContent': {
        templateUrl: 'templates/makeloteentrada.html',
        controller: 'MakeloteentradaCtrl'
      }
    },
    params: {
      warehouse: ''
    }
  })
  .state('main.mover', {
    url: '/mover',
    views: {
      'menuContent': {
        templateUrl: 'templates/mover.html',
        controller: 'MoverCtrl'
      }
    },
    params: {
      warehouse: ''
    }
  })
  .state('main.marcainicio', {
    url: '/marcainicio',
    views: {
      'menuContent': {
        templateUrl: 'templates/marcainicio.html',
        controller: 'MarcainicioCtrl'
      }
    },
    params: {
      step: ''
    }
  })
  .state('main.marcatermino', {
    url: '/marcatermino',
    views: {
      'menuContent': {
        templateUrl: 'templates/marcatermino.html',
        controller: 'MarcaterminoCtrl'
      }
    },
    params: {
      step: ''
    }
  })


  //$urlRouterProvider.otherwise('/main/home');
})
.filter('price', [
function() { // should be altered to suit your needs
    return function(input) {
      var ret=(input)?input.toString().trim().replace(",",".").toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."):0;
      return ("$ "+ret);
    };
}])
.directive('onDoubleClick', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $elm, $attrs) {

            var clicks = 0;

            $elm.bind('click', function(evt) {
               
                clicks++;
                if (clicks == 1) {
                    $timeout(function() {
                        if (clicks == 1) {
                            //....
                        } else {
                            $scope.$apply(function() {
                               
                                $scope.$eval($attrs.onDoubleClick);
                            });
                        }
                        clicks = 0;
                    }, 300);
                }
            });

        }
    };
});


document.addEventListener("offline", function() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
}, false);

document.addEventListener("online", function() {
  var $body = angular.element(document.body);
  var $rootScope = $body.injector().get('$rootScope');
  $rootScope.$apply();
}, false);

function usercode() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('md5login').value = "8f14e45fceea167a5a36dedd4bea2543";
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();
} 
function codigo() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_barra').value = "EPP00CUE00A0067";
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();
} 
function consumo() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_consumo').value = "VC0000400000003";
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function ot0() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_ot1').value = "OT00000003";
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function recibir(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_bo1').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}

function asignar(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('asigna_etapa_pieza').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function terminar(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('asigna_etapa_pieza').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function lotear(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('pieza_lote_entrada').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function termino(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('pieza_lote_salida').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
/*
function ot() {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_ott').value = "OT00000001";
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}

function lotear(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_box').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
function mover(z) {
  var $body = angular.element(document.body);            // 1
  var $rootScope = $body.injector().get('$rootScope');   // 2b
  document.getElementById('textbox_moveme').value = (z ? z : "1219000010005");
  $rootScope.$broadcast("scanner", { });
  $rootScope.$apply();  
}
*/
jQuery.ajaxSetup({
  type: 'POST',
  timeout: 5000,
  error: function(xhr) {
    console.log('AjaxSetup Error');
    
    var $body = angular.element(document.body);            // 1
    var $rootScope = $body.injector().get('$rootScope');   // 2b
    $rootScope.refreshing = 0;
    $rootScope.hideload(); 
    $rootScope.$apply();   
    //var event = new CustomEvent("offline", { "detail": "Example" });
    //document.dispatchEvent(event);
  }
});

document.addEventListener('keypress', getInput, false);

function getInput(e){
  if (e.which == 13) {
    var $body = angular.element(document.body);            // 1
    var $rootScope = $body.injector().get('$rootScope');   // 2b
    $rootScope.$broadcast("scanner", { });
    $rootScope.$apply();
  }
}

