import styled from 'styled-components/native';

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
  width: 100%;
`;
