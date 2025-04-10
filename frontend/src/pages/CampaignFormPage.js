import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaign } from '../context/CampaignContext';
import { useForm } from '../hooks/useForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const initialValues = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '',
  targetAudience: ''
};

const validate = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.description) errors.description = 'Description is required';
  if (!values.startDate) errors.startDate = 'Start date is required';
  if (!values.endDate) errors.endDate = 'End date is required';
  if (!values.budget) errors.budget = 'Budget is required';
  if (!values.targetAudience) errors.targetAudience = 'Target audience is required';
  return errors;
};

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createCampaign, updateCampaign, getCampaign } = useCampaign();
  const { values, errors, touched, handleChange, handleBlur, setValues } = useForm(initialValues, validate);

  useEffect(() => {
    if (id) {
      const fetchCampaign = async () => {
        const campaign = await getCampaign(id);
        if (campaign) setValues(campaign);
      };
      fetchCampaign();
    }
  }, [id, getCampaign, setValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;

    try {
      if (id) {
        await updateCampaign(id, values);
      } else {
        await createCampaign(values);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title={id ? 'Edit Campaign' : 'Create Campaign'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            label="Campaign Name"
            value={values.name}
            error={touched.name && errors.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <Input
            name="description"
            label="Description"
            value={values.description}
            error={touched.description && errors.description}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="startDate"
              type="date"
              label="Start Date"
              value={values.startDate}
              error={touched.startDate && errors.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Input
              name="endDate"
              type="date"
              label="End Date"
              value={values.endDate}
              error={touched.endDate && errors.endDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <Input
            name="budget"
            type="number"
            label="Budget"
            value={values.budget}
            error={touched.budget && errors.budget}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <Input
            name="targetAudience"
            label="Target Audience"
            value={values.targetAudience}
            error={touched.targetAudience && errors.targetAudience}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit">
              {id ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CampaignFormPage; 