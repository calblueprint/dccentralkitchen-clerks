import React from 'react';
import { View } from 'react-native';
import { LineItem, LineItemRow } from '../styled/checkout.js';
import Colors from '../assets/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { ButtonContainer, ButtonLabel } from './BaseComponents';

/**
 * @prop
 **/

function BackButton({ navigation }) {
  return (
    <ButtonContainer style={{ marginTop: 33, marginLeft: 29 }} onPress={() => navigation.goBack()}>
      <FontAwesome5 name="arrow-left" size={24} color={Colors.activeText} />
    </ButtonContainer>
  );
}

export default BackButton;
