import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../assets/Colors';
import { ButtonContainer } from './BaseComponents';

function DrawerButton({ navigation, light, style }) {
  return (
    <ButtonContainer style={{ ...style }} onPress={() => navigation.toggleDrawer()}>
      <FontAwesome5 name="bars" size={24} color={light ? Colors.lightest : Colors.activeText} />
    </ButtonContainer>
  );
}

DrawerButton.propTypes = {
  navigation: PropTypes.object.isRequired,
  light: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

DrawerButton.defaultProps = {
  style: {},
};

export default DrawerButton;
