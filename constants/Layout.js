import { Dimensions } from 'react-native';

export const Window = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export const isTablet = Math.max(Window.width, Window.height) > 1000;
