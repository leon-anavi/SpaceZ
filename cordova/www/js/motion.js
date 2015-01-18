var motion = {

  nStep: 0.5,

  showError: function(err) {
    console.log('Error: ' + err.message);
  },

  motionDetected: function(event) {
    if (true === bIsPaused) {
      return;
    }

    var acc = event.accelerationIncludingGravity;
    var nDeviceX = (acc.x) ? acc.x : 0;

    if (true === app.bIsTablet) {
      nDeviceX = (acc.y) ? acc.y : 0;
    }

    if (nDeviceX > motion.nStep) {
      movementLeft();
    }
    else if (nDeviceX < (-1*motion.nStep)) {
      movementRight();
    }
    else {
      movementStop();
    }
  },

  deviceMotion: function() {
    try {
      if (!window.DeviceMotionEvent) {
        throw new Error('device motion not supported.');
      }
      window.addEventListener('devicemotion', motion.motionDetected, false);
    } catch (err) {
      motion.showError(err);
    }
  },

};
