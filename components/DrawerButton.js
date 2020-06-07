import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Keyboard } from 'react-native';
import Colors from '../constants/Colors';
import { ButtonContainer } from './BaseComponents';

function DrawerButton({ navigation, light, style }) {
  return (
    <ButtonContainer
      style={{ ...style }}
      onPress={() => {
        Keyboard.dismiss();
        navigation.toggleDrawer();
      }}>
      <FontAwesome5 name="bars" size={24} color={light ? Colors.lightText : Colors.activeText} />
    </ButtonContainer>
  );
}

DrawerButton.propTypes = {
  navigation: PropTypes.object.isRequired,
  light: PropTypes.bool,
  style: PropTypes.object,
};

DrawerButton.defaultProps = {
  light: false,
  style: {},
};

export default DrawerButton;
