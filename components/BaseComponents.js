import styled from 'styled-components/native';
import Colors from '../constants/Colors';

// Text Components
export const BigTitle = styled.Text`
  font-family: poppins-medium;
  font-size: 32px;
  line-height: 48px;
  color: ${(props) => props.color || Colors.activeText};
`;

export const Title = styled.Text`
  font-family: poppins-medium;
  font-size: 20px;
  line-height: 30px;
  color: ${(props) => props.color || Colors.activeText};
`;

export const Subtitle = styled.Text`
  font-family: poppins-regular;
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => props.color || Colors.activeText};
`;

export const Body = styled.Text`
  font-family: poppins-regular;
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.color || Colors.activeText};
`;

export const Caption = styled.Text`
  font-family: poppins-medium;
  font-size: 12px;
  line-height: 16px;
  color: ${(props) => props.color || Colors.activeText};
`;

export const Overline = styled.Text`
  font-family: poppins-regular;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  color: ${(props) => props.color || Colors.activeText};
`;

// Buttons
export const ButtonContainer = styled.TouchableOpacity``;

export const ButtonLabel = styled.Text`
  font-family: poppins-semibold;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  text-transform: ${(props) => (props.noCaps ? ' none' : 'uppercase')};
  color: ${(props) => props.color || Colors.lightText};
`;

export const BigTitleButtonLabel = styled(BigTitle)`
  line-height: 54px;
  text-align: center;
  color: ${(props) => props.color || Colors.lightText};
`;

export const FilledButtonContainer = styled(ButtonContainer)`
  width: ${(props) => props.width || 'auto'};
  height: ${(props) => props.height || '40px'};
  padding-horizontal: 24px;
  background: ${(props) => props.color || Colors.primaryGreen};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 2px;
`;

export const RoundedButtonContainer = styled(FilledButtonContainer)`
  border-radius: 20px;
  width: ${(props) => props.width || 'auto'};
  height: ${(props) => props.height || '40px'};
`;

export const SquareButtonContainer = styled(FilledButtonContainer)`
  height: ${(props) => props.side || '54px'};
`;
