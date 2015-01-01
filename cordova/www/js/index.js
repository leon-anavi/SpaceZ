var app = {

    bIsTablet : false,

    // Application Constructor
    initialize: function() {
      this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

      if ( 'Android' == device.platform )
      {
        document.addEventListener( "backbutton", app.handleBackHardwareButton , false );
      }

      var sUserAgent = window.navigator.userAgent.toLowerCase();
      console.log('ua: '+sUserAgent);
      if (-1 === sUserAgent.indexOf('mobile'))
      {
        app.bIsTablet = true;
      }

      screen.lockOrientation('portrait');

      document.getElementById('linkOpenSource').onclick=function(){
        window.open('https://github.com/leon-anavi/SpaceZ', '_system');
      };

      document.getElementById('loading').setAttribute('style', 'display:none;');
      var menu = document.getElementById('menu');
      menu.setAttribute('style', 'visibility:visible;');
      initCanvas();
    },

    handleBackHardwareButton : function() {
      if ( ("visible" ===document.getElementById('game').style.visibility) &&
            (false === bIsPaused) )
      {
        pause();
      }
      else
      {
        navigator.app.exitApp();
      }
    },

};
