import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import Colors from '../constants/Colors';
import { ColumnContainer, RowContainer } from '../styled/shared';
import { Body, ButtonContainer, ButtonLabel } from './BaseComponents';

function ErrorMessage({ light, errorMsg, buttonMsg, callback, errorShown }) {
  return (
    <ColumnContainer>
      {errorShown && (
        <RowContainer style={{ alignItems: 'center', marginTop: 8 }}>
          <FontAwesome5 name="exclamation-circle" size={14} color={Colors.error} style={{ marginRight: 8 }} />
          <Body color={light ? Colors.lightText : Colors.activeText}>{errorMsg}</Body>
        </RowContainer>
      )}
      {buttonMsg !== '' && (
        <ButtonContainer onPress={errorShown ? callback : null}>
          <ButtonLabel noCaps color={Colors.primaryGreen}>
            {errorShown ? buttonMsg : ' '}
          </ButtonLabel>
        </ButtonContainer>
      )}
    </ColumnContainer>
  );
}

ErrorMessage.propTypes = {
  light: PropTypes.bool,
  errorMsg: PropTypes.string.isRequired,
  buttonMsg: PropTypes.string,
  callback: PropTypes.func,
  errorShown: PropTypes.bool.isRequired,
};

ErrorMessage.defaultProps = {
  light: false,
  buttonMsg: '',
  callback: null,
};

export default ErrorMessage;
