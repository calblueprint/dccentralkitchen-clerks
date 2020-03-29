import styled from 'styled-components/native';
import Colors from '../assets/Colors';
import { Subhead } from '../components/BaseComponents';
import { ColumnContainer, RowContainer } from './shared';

// Modals in CheckoutScreen.js

// top: -200px is temp fix for avoiding the keyboard
export const ModalContentContainer = styled(ColumnContainer)`
  width: ${props => props.width || '45%'};
  height: ${props => props.height || '40%'};
  margin: auto;
  justify-content: space-around;
  align-items: center;
  background-color: white;
`;

export const ModalCenteredOpacityLayer = styled(RowContainer)`
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
`;

export const ModalCopyContainer = styled(ColumnContainer)`
  justify-content: space-around;
  align-items: ${props => props.alignItems || 'flex-start'};
`;

// Rewards
export const SubheadSecondary = styled(Subhead)`
  color: ${Colors.secondaryText};
`;

export const SubheadActive = styled(Subhead)`
  color: ${Colors.activeText};
`;

// Quantity
export const QuantityInput = styled.TextInput.attrs({
  keyboardType: 'numeric',
  maxLength: 3,
})`
  border-width: 1px;
  border-color: ${Colors.activeText};
  height: 40px;
  width: 200px;
  color: ${Colors.activeText};
  font-family: 'poppins-regular';
  font-size: 16px;
  text-align: left;
  padding: 10px 16px;
`;
