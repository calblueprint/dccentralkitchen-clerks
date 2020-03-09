import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import Colors from '../assets/Colors';

export const FlatListContainer = styled(FlatList)`
  width: 100%;
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
  height: 88px;
  background: ${Colors.lightest};
  border: 1px solid ${Colors.lighter};
  border-left-width: 0px;
  border-right-width: 0px;
  padding-left: 24px;
  padding-right: 26px;
  padding: 13px 26px 11px 24px;
`;

export const LineItemRow = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
