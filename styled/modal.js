import styled from 'styled-components/native';
import Colors from '../assets/Colors';
import { ColumnContainer, RowContainer } from './shared';

// Modals in CheckoutScreen.js

export const ModalContentContainer = styled(ColumnContainer)`
  height: 40%;
  width: 45%;
  margin: auto;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  top: -200px;
`;

export const QuantityInput = styled.TextInput.attrs({
  keyboardType: 'numeric',
  maxLength: 3
})`
  border-width: 1px;
  border-color: ${Colors.activeText};
  height: 40px;
  width: 200px;
  color: ${Colors.activeText};
  font-size: 18px;
  font-weight: normal;
  text-align: left;
  padding: 10px 16px;
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
  align-items: flex-start;
`;
