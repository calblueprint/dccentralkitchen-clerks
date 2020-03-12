import styled from 'styled-components/native';
import Colors from '../assets/Colors';

export const CheckInContainer = styled.View`
  background-color: ${props => props.color || Colors.activeText};
  height: 100%;
  width: 100%;
`;

// Question: Why doesn't justify-content work? // Gotta fix margin
export const CheckInContentContainer = styled.View`
    display: flex
    flex-direction: column;
    align-items: center;
    margin: 15% 0;
`;

export const TextField = styled.TextInput`
  width: 253px;
  height: 51px;
  background-color: #fff;
  border-color: ${Colors.base};
  border-width: 1px;
  padding-left: 16px;
`;
