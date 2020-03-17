import styled from 'styled-components/native';
import { FilledButtonContainer } from '../components/BaseComponents';

// Ostensibly will be deprecated in favor of
// per-component and better-named containers
export const Container = styled.View`
  flex: 1;
  display: flex;
  width: 100%;
`;

// Ostensibly will be deprecated
export const ScrollCategory = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

// Shared between Login and CustomerLookup
export const SubmitButton = styled.Button`
  position: absolute;
  top: -300px;
`;

// Shared between CustomerLookup and Checkout
// Ostensibly will be deprecated
export const TextHeader = styled.Text`
  font-weight: bold;
  font-size: 18px;
  text-align: center;
`;

// Shared between Login and CustomerLookup
export const TextInput = styled.TextInput`
  background-color: #008550;
  height: 60px;
  width: 100%;
  color: black;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`;

export const RowContainer = styled.View`
  display: flex;
  flex-direction: row;
`;

export const ColumnContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

export const SpaceBetweenRowContainer = styled(RowContainer)`
  justify-content: space-between;
`;

export const RoundedButtonContainer = styled(FilledButtonContainer)`
  border-radius: 20px;
  margin: 12px;
  width: ${props => props.width || '160px'};
  height: ${props => props.height || '39px'};
`;
