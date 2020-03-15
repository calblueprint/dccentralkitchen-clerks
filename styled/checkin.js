import styled from 'styled-components/native';
import Colors from '../assets/Colors';

export const CheckInContainer = styled.View`
  background-color: ${props => props.color || Colors.activeText};
  flex: 1;
`;

// Question: Why doesn't justify-content work? // Gotta fix margin
export const CheckInContentContainer = styled.View`
    display: flex
    flex-direction: column;
    align-items: center;
    margin: 15%
`;

export const TextField = styled.TextInput`
  width: 253px;
  height: 51px;
  background-color: #fff;
  border-color: ${Colors.base};
  border-width: 1px;
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
