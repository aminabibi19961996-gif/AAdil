import ExceptionsManager from 'react-native/Libraries/Core/ExceptionsManager';

if (__DEV__) {
  ExceptionsManager.handleException = (error, isFatal) => {
    // no-op
  };
}

import 'react-native-url-polyfill/auto';
import './src/__create/polyfills';
global.Buffer = require('buffer').Buffer;

import '@expo/metro-runtime';
import { AppRegistry, LogBox } from 'react-native';
import { DeviceErrorBoundaryWrapper } from './__create/DeviceErrorBoundary';
import AnythingMenu from './src/__create/anything-menu';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import App from './entrypoint'


if (__DEV__ || process.env.EXPO_PUBLIC_CREATE_ENV === 'DEVELOPMENT') {
  LogBox.ignoreAllLogs();
  LogBox.uninstall();
}

// Error boundary must wrap in ALL environments (including production)
// so crashes show a recovery screen instead of a permanent white screen.
AppRegistry.setWrapperComponentProvider(() => ({ children }) => {
  return (
    <DeviceErrorBoundaryWrapper>
      {children}
    </DeviceErrorBoundaryWrapper>
  );
});

renderRootComponent(App);
