import { Platform } from 'react-native';
import styled from 'styled-components/native';
import Colors from '../assets/Colors';

export const CheckInContainer = styled.KeyboardAvoidingView.attrs({
  behavior: Platform.OS === 'ios' ? 'position' : null,
  keyboardVerticalOffset: -200
})`
  background-color: ${props => props.color || Colors.activeText};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const CheckInContentContainer = styled.View`
    display: flex
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const TextField = styled.TextInput`
  width: 253px;
  height: 51px;
  background-color: #fff;
  border-color: ${props => (props.error ? Colors.error : Colors.base)};
  border-width: 2px;
  padding-left: 14px;
  font-family: poppins-regular;
`;

export const SearchElement = styled.TouchableOpacity`
  width: 253px;
  height: 51px;
  background-color: #fff;
  border-color: ${Colors.base};
  border-width: 1px;
  padding-left: 16px;
  justify-content: center;
`;

export const SearchBarContainer = styled.View`
  height: 179px;
`;
