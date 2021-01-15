import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Colors from '../constants/Colors';
import { Caption } from './BaseComponents';

function BadgeIcon({ badgeContent, icon }) {
  return (
    <View>
      <FontAwesome5 name={icon} size={24} color={Colors.activeText} />
      <View
        style={{
          backgroundColor: Colors.primaryGreen,
          borderRadius: 20,
          height: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -5,
        }}>
        <Caption color={Colors.bgLight}>{badgeContent}</Caption>
      </View>
    </View>
  );
}

BadgeIcon.propTypes = {
  badgeContent: PropTypes.string,
  icon: PropTypes.string.isRequired,
};

BadgeIcon.defaultProps = {
  badgeContent: '',
};

export default BadgeIcon;
