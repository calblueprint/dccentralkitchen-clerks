import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import Colors from '../assets/Colors';

export const FlatListContainer = styled(FlatList)`
  width: 100%;
`;

// Customer Name Top Bar

export const TopBar = styled.View`
  height: 55px;
  width: 100%;
  background: ${Colors.base};
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// Alphabetical Tab Bottom Bar

export const BottomBar = styled.View`
  height: 57px;
  width: 100%;
  background: ${Colors.base};
  flex: 1;
`;

// Tabs

export const TabContainer = styled.TouchableOpacity`
  height: 57px;
  width: 119px;
  border: 1px solid ${Colors.lightest};
  background: ${Colors.base};
  border-top-width: 0px;
  border-bottom-width: 0px;
  justify-content: center;
  align-items: center;
`;

// Products Section

export const ProductsContainer = styled.View`
  background: rgba(235, 235, 235, 0.5);
`;

export const SaleContainer = styled.View`
  flex: 1;
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
  padding: 12px 24px 12px 24px;
`;

export const LineItemRow = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
