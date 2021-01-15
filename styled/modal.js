import styled from 'styled-components/native';
import { Subtitle } from '../components/BaseComponents';
import Colors from '../constants/Colors';
import { isTablet } from '../constants/Layout';
import { ColumnContainer, RowContainer, SpaceBetweenRowContainer } from './shared';

// Modals in CheckoutScreen.js
export const ModalHeaderBar = styled(SpaceBetweenRowContainer)`
  align-items: center;
  border: 1px solid ${Colors.lighterGray};
  border-top-width: 0px;
  border-right-width: 0px;
  border-left-width: 0px;
  height: 50px;
`;

export const ModalContainer = styled(ColumnContainer)`
  width: ${!isTablet ? '90%' : '50%'};
  margin: auto;
  margin-top: 50px;
  background-color: ${Colors.bgLight};
`;

export const ModalContentContainer = styled(ColumnContainer)`
  padding: 24px;
`;

export const ModalCenteredOpacityLayer = styled(RowContainer)`
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
`;

// Rewards
export const SubtitleSecondary = styled(Subtitle)`
  color: ${Colors.secondaryText};
`;

export const SubtitleActive = styled(Subtitle)`
  color: ${Colors.activeText};
`;

// Quantity
export const QuantityInput = styled.TextInput.attrs({
  keyboardType: 'numeric',
  maxLength: 3,
})`
  border-width: 1px;
  border-color: ${Colors.activeText};
  width: 200px;
  color: ${Colors.activeText};
  font-family: 'opensans-regular';
  font-size: 16px;
  text-align: left;
  padding: 10px 16px;
`;
