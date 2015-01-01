function extend() {
  for(var nIter=1; nIter<arguments.length; nIter++) {
    for(var key in arguments[nIter]) {
      if(arguments[nIter].hasOwnProperty(key)) {
        arguments[0][key] = arguments[nIter][key];
      }
    }
  }
  return arguments[0];
}

(function() {
  function LoaderProxy() {
    return {
      draw: function() {},
      fill: function(){},
      frame: function(){},
      update: function(){},
      width: null,
      height: null
    };
  }

  function Sprite(image, sourceX, sourceY, width, height) {
    sourceX = sourceX || 0;
    sourceY = sourceY || 0;
    width = width || image.width;
    height = height || image.height;

    return {
      draw: function(canvas, x, y) {
        canvas.drawImage(
          image,
          sourceX,
          sourceY,
          width,
          height,
          x,
          y,
          width,
          height
        );
      },

      fill: function(canvas, x, y, width, height, repeat) {
        repeat = repeat || "repeat";
        var pattern = canvas.createPattern(image, repeat);
        canvas.fillColor(pattern);
        canvas.fillRect(x, y, width, height);
      },

      width: width,
      height: height
    };
  };

  Sprite.load = function(url, loadedCallback) {
    var img = new Image();
    var proxy = LoaderProxy();

    img.onload = function() {
      var tile = Sprite(this);

      extend(proxy, tile);

      if(loadedCallback) {
        loadedCallback(proxy);
      }
    };

    img.src = url;

    return proxy;
  };

  var spriteImagePath = "images/";

  window.Sprite = function(name, callback) {
    return Sprite.load(spriteImagePath + name + ".png", callback);
  };
  window.Sprite.EMPTY = LoaderProxy();
  window.Sprite.load = Sprite.load;
}());
