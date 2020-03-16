import styled from 'styled-components/native';
import Colors from '../assets/Colors';
import { FilledButtonContainer } from '../components/BaseComponents';
import { ColumnContainer, RowContainer } from './shared';

// Customer Name Top Bar

export const TopBar = styled.View`
  height: 55px;
  width: 100%;
  background: ${Colors.base};
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Products Section

export const ProductsContainer = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
})`
  background: rgba(235, 235, 235, 0.5);
  flex-wrap: wrap;
  width: 65%;
`;

export const SaleContainer = styled(ColumnContainer)`
  padding: 13px 14px 0px;
  align-items: center;
  width: 35%;
`;

// Product Cards

export const ProductCard = styled.View`
  width: 129px;
  height: 148px;
  background: ${Colors.lightest};
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.12);
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  margin: 12px;
  border-radius: 4px;
  padding: 8px 8px 10px;
`;

// Transaction Line Items

export const LineItem = styled.View`
  width: 329px;
  background: ${Colors.lightest};
  border: 1px solid ${Colors.lighter};
  border-left-width: 0px;
  border-right-width: 0px;
  padding-left: 24px;
  padding-right: 26px;
  padding: 12px 24px 12px 24px;
`;

export const LineItemRow = styled(RowContainer)`
  justify-content: space-between;
  align-items: center;
`;

export const RewardAvailableContainer = styled(FilledButtonContainer)`
  width: 159px;
  height: 44px;
  background: ${Colors.lighter};
  border: 1px solid ${Colors.light};
  border-radius: 9px;
  margin: 8px 0px;
`;

export const RewardAppliedContainer = styled(FilledButtonContainer)`
  width: 159px;
  height: 44px;
  background: ${Colors.lightest};
  border: 1px solid ${Colors.light};
  border-radius: 9px;
  margin: 8px 0px;
`;
