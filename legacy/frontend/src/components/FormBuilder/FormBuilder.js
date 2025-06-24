// Remove submit button from the toolbar
const FormBuilderToolbar = ({ onSave, onPreview }) => {
  return (
    <div className="form-builder-toolbar">
      <div className="toolbar-actions">
        <button 
          className="btn btn-secondary"
          onClick={onPreview}
        >
          <i className="icon-eye"></i> Preview
        </button>
        <button 
          className="btn btn-primary"
          onClick={onSave}
        >
          <i className="icon-save"></i> Save Form
        </button>
      </div>
    </div>
  );
};

const FormBuilder = () => {
  const handleSave = async () => {
    // Logic for saving the form
  };
  
  const handlePreview = () => {
    // Logic for previewing the form
  };
  
  return (
    <div className="form-builder">
      <FormBuilderToolbar 
        onSave={handleSave} 
        onPreview={handlePreview}
      />
      {/* Additional form builder content */}
    </div>
  );
};

export { FormBuilder, FormBuilderToolbar };