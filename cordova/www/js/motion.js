var motion = {

  nStep: 1,

  showError: function(err) {
    console.log('Error: ' + err.message);
  },

  motionDetected: function(event) {
    if (true === bIsPaused)
    {
      return;
    }

    var acc = event.accelerationIncludingGravity;
    var nDeviceX = (acc.x) ? acc.x : 0;

    if (true === app.bIsTablet) {
      console.log('motion tablet');
      nDeviceX = (acc.y) ? acc.y : 0;
    }

    if (nDeviceX > motion.nStep)
    {
      goLeft();
    }
    else if (nDeviceX < (-1*motion.nStep))
    {
      goRight();
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
