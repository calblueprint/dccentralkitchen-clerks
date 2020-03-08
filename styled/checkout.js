import { FlatList } from 'react-native';
import Colors from '../assets/Colors';
import styled from 'styled-components/native';

export const ProductContainer = styled.View`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin: 5% 5%;
  box-shadow: 0px 10px 20px #e3e1e1;
`;

export const ProductBody = styled.Text`
  font-size: 12px;
  font-weight: bold;
`;

export const ProductCardContainer = styled.View`
  align-items: center;
  background-color: #ffff;
  border-radius: 5px;
  padding: 20px;
  margin: 1% 1%;
  box-shadow: 0px 10px 20px #e3e1e1;
`;

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
  margin: 12px;
  border-radius: 4px;
`;

export const ItemName = styled.Text`
  font-family: 'poppins-regular';
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.black};
  margin-top: 8px;
  margin-left: 8px;
`;

export const ItemDetail = styled.Text`
  font-family: 'poppins-medium';
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.secondaryText};
  margin-left: 8px;
`;

// Transaction Line Items

export const LineItem = styled.View`
  width: 329px;
  height: 88px;
  background: ${Colors.lightest};
  border: 1px solid ${Colors.lighter};
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-left-width: 0px;
  border-right-width: 0px;
`;

export const LineItemName = styled.Text`
  font-family: 'poppins-regular';
  font-size: 16px;
  line-height: 24px;
  color: ${Colors.black};
  text-transform: uppercase;
`;

export const LineItemDetail = styled.Text`
  font-family: 'poppins-regular';
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.secondaryText};
`;

export const LineItemQuantity = styled.Text`
  font-family: 'poppins-regular';
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.secondaryText};
`;

export const LineItemPrice = styled.Text`
  font-family: 'poppins-regular';
  font-size: 16px;
  line-height: 24px;
  color: ${Colors.black};
`;

export const LineItemPoints = styled.Text`
  font-family: 'poppins-regular';
  font-size: 16px;
  line-height: 24px;
  color: ${Colors.secondaryText};
`;
