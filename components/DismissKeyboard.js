import PropTypes from 'prop-types';
import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

function DismissKeyboard({ children }) {
  return <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>;
}

// Wraps React elements
DismissKeyboard.propTypes = {
  children: PropTypes.object.isRequired,
};

export default DismissKeyboard;
