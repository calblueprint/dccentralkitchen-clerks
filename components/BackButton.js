import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { ButtonContainer } from './BaseComponents';

function BackButton({ navigation, light, style }) {
  return (
    <ButtonContainer style={{ ...style }} onPress={() => navigation.goBack()}>
      <FontAwesome5 name="arrow-left" size={24} color={light ? Colors.lightest : Colors.activeText} />
    </ButtonContainer>
  );
}

BackButton.propTypes = {
  navigation: PropTypes.object.isRequired,
  light: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

BackButton.defaultProps = {
  style: {},
};

export default BackButton;
