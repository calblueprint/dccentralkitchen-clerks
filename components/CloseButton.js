import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { ButtonContainer } from './BaseComponents';

function CloseButton({ navigation, light, style }) {
  return (
    <ButtonContainer style={{ ...style }} onPress={() => navigation.goBack()}>
      <FontAwesome5 name="times" size={24} color={light ? Colors.lightText : Colors.activeText} />
    </ButtonContainer>
  );
}

CloseButton.propTypes = {
  navigation: PropTypes.object.isRequired,
  light: PropTypes.bool,
  style: PropTypes.object,
};

CloseButton.defaultProps = {
  light: false,
  style: {},
};

export default CloseButton;
