# SpaceZ

## Overview
SpaceZ is an open source HTML5 2D endless space game wrapped with Cordova for mobile devices. The source code is available under GPLv3.

## Installation

Perform the following steps to get the source code, build and run the game on Android device or emulator:
* Make sure that you have successfully installed Cordova and Android SDK.
* Obtain the source code:
```
git clone https://github.com/leon-anavi/SpaceZ
cd SpaceZ/cordova/
```
* Add plugins:
```
cordova plugin add net.yoik.cordova.plugins.screenorientation
cordova plugin add org.apache.cordova.device
cordova plugin add org.apache.cordova.inappbrowser
cordova plugin add org.apache.cordova.vibration
cordova plugin add com.mediamatrixdoo.keepscreenon
```
* Add support for Android:
```
cordova platform add android
```
* Build and run the application on Android device or emulator:
```
cordova run android
```
* Enjoy :)

### History

This simple game was initially created for desktop browsers long ago, as far as I remember at the end of 2011. It is based on some free tutorials and it has been developed with HTML5 and pure JavaScript, without any fancy frameworks and libraries. My friend Konstantin Gaytandzhiev created the magnificent graphics. In 2011 versions of the same game were ported to Symbian and MeeGo netbooks and published at application stores under the name Planetoids.

In January 2015 the project was rebooted, wrapped with Cordova for Android and the source code was released at GitHub under GPLv3.

