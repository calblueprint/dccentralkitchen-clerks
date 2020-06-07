import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-native';
import Colors from '../constants/Colors';
import { ButtonContainer } from './BaseComponents';

function BackButton({ navigation, light, style, confirm }) {
  return (
    <ButtonContainer
      style={{ ...style }}
      onPress={() => {
        if (confirm > 0) {
          Alert.alert(
            'Are you sure you want to cancel this sale?',
            'If you cancel, this transaction will not be saved.',
            [
              {
                text: 'Cancel this sale',
                onPress: () => navigation.goBack(),
                style: 'destructive',
              },
              {
                text: 'Stay and continue checkout',
                style: 'cancel',
              },
            ]
          );
        } else {
          navigation.goBack();
        }
      }}>
      <FontAwesome5 name="arrow-left" size={24} color={light ? Colors.lightText : Colors.activeText} />
    </ButtonContainer>
  );
}

BackButton.propTypes = {
  navigation: PropTypes.object.isRequired,
  light: PropTypes.bool,
  style: PropTypes.object,
  confirm: PropTypes.bool,
};

BackButton.defaultProps = {
  light: false,
  style: {},
  confirm: false,
};

export default BackButton;
