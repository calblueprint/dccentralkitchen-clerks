import styled from 'styled-components/native';
import Colors from '../assets/Colors';

// Text Components
export const Title = styled.Text`
  font-family: poppins-medium;
  font-size: 20px;
  line-height: 30px;
  color: ${props => props.color || Colors.black};
`;

export const Subhead = styled.Text`
  font-family: poppins-regular;
  font-size: 16px;
  line-height: 24px;
  color: ${props => props.color || Colors.black};
`;

export const Body = styled.Text`
  font-family: poppins-regular;
  font-size: 14px;
  line-height: 20px;
  color: ${props => props.color || Colors.black};
`;

export const Caption = styled.Text`
  font-family: poppins-medium;
  font-size: 12px;
  line-height: 16px;
  color: ${props => props.color || Colors.black};
`;

export const Overline = styled.Text`
  font-family: poppins-regular;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  color: ${props => props.color || Colors.black};
`;

// Buttons
export const ButtonContainer = styled.TouchableOpacity``;

export const ButtonLabel = styled.Text`
  top: 25%;
  bottom: 25%;
  font-family: poppins-semibold;
  font-size: 14px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.01px;
  text-transform: uppercase;
  color: ${Colors.lightest};
`;

export const FilledButtonContainer = styled(ButtonContainer)`
  width: ${props => props.width || '309px'};
  height: ${props => props.height || '57px'}
  background: ${props => (props.color ? props.color : Colors.primaryGreen)};
  border-radius: 20px;
`;
