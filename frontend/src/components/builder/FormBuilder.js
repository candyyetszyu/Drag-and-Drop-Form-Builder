import React from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useFormBuilder } from '../../context/FormBuilderContext';
import TextInputField from '../shared/TextInputField';
import DropdownField from '../shared/DropdownField';
import TableField from '../shared/TableField';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldConfigPanel from './FieldConfigPanel';
import LogicConfigPanel from './LogicConfigPanel';
import ColumnEditor from './ColumnEditor';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const LeftPanel = styled.div`
  width: 250px;
  padding: 1rem;
  background: white;
  border-right: 1px solid #ddd;
`;

const MainPanel = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const RightPanel = styled.div`
  width: 300px;
  padding: 1rem;
  background: white;
  border-left: 1px solid #ddd;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: white;
  border-bottom: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#5a6268'};
  }
`;

const FormBuilder = () => {
  const { state, dispatch } = useFormBuilder();
  const { fields, selectedField, isPreview } = state;

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      console.log('Saving form:', state);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handlePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        <LeftPanel>
          <FieldPalette />
        </LeftPanel>
        <MainPanel>
          <Toolbar>
            <div>
              <Button onClick={handlePreview}>
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            <div>
              <Button primary onClick={handleSave}>
                Save
              </Button>
            </div>
          </Toolbar>
          <FormCanvas />
        </MainPanel>
        <RightPanel>
          {selectedField ? (
            <>
              <FieldConfigPanel />
              {selectedField.type === 'table' && <ColumnEditor />}
              <LogicConfigPanel />
            </>
          ) : (
            <div>Select a field to configure</div>
          )}
        </RightPanel>
      </Container>
    </DndProvider>
  );
};

export default FormBuilder; 