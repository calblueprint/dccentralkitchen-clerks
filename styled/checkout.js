import { FlatList } from 'react-native';
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
  flex: 1;
  display: flex;
  width: 100%;
`;
