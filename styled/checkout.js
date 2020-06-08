import { Platform } from 'react-native';
import styled from 'styled-components/native';
import Colors from '../constants/Colors';
import { ColumnContainer, RowContainer } from './shared';

// Customer Name Top Bar
// Adjusts spacing for Android devices with status bars.
export const TopBar = styled.View`
  height: ${Platform.OS === 'android' ? '80px' : '60px'};
  align-items: ${Platform.OS === 'android' ? 'flex-end' : 'center'};
  padding-bottom: ${Platform.OS === 'android' ? '16px' : '0px'};
  width: 100%;
  background: ${(props) => (props.trainingColor ? Colors.trainingMode : Colors.primaryGray)};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
// Alphabetical Tab Bottom Bar

export const BottomBar = styled.View`
  height: 57px;
  width: 100%;
  background: ${Colors.primaryGray};
`;

// Tabs

export const TabContainer = styled.TouchableOpacity`
  height: 57px;
  width: 119px;
  border: 1px solid ${Colors.bgLight};
  background: ${Colors.primaryGray};
  border-top-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  justify-content: center;
  align-items: center;
`;

// Products Section

export const ProductsContainer = styled.ScrollView.attrs({
  contentContainerStyle: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})`
  background: rgba(235, 235, 235, 0.5);
  flex-wrap: wrap;
  flex: 5;
`;

export const SaleContainer = styled(ColumnContainer)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 2;
  background: ${Colors.bgLight};
`;

// Product Cards

export const ProductCard = styled.View`
  width: 129px;
  height: 148px;
  background: ${Colors.bgLight};
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.12);
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.14);
  elevation: 2;
  display: flex;
  flex-direction: column;
  margin: 6px;
  border-radius: 4px;
  padding: 8px 8px 10px;
`;

// Transaction Line Items

export const LineItem = styled.View`
  width: 281px;
  background: ${Colors.bgLight};
  border: 1px solid ${Colors.lightestGray};
  border-left-width: 0px;
  border-right-width: 0px;
  padding: 12px 24px 12px 24px;
`;

export const LineItemRow = styled(RowContainer)`
  justify-content: space-between;
  align-items: center;
`;
