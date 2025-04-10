import { createContext, useContext, useState, useCallback } from 'react';
import { campaignService } from '../api/campaignService';
import { useApi } from '../hooks/useApi';

const CampaignContext = createContext(null);

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { request, isLoading, error } = useApi(campaignService.getAll);

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await request();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  }, [request]);

  const getCampaign = useCallback(async (id) => {
    try {
      const data = await campaignService.getById(id);
      setSelectedCampaign(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch campaign:', err);
      return null;
    }
  }, []);

  const createCampaign = useCallback(async (data) => {
    try {
      const newCampaign = await campaignService.create(data);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      return null;
    }
  }, []);

  const updateCampaign = useCallback(async (id, data) => {
    try {
      const updatedCampaign = await campaignService.update(id, data);
      setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
      if (selectedCampaign?.id === id) setSelectedCampaign(updatedCampaign);
      return updatedCampaign;
    } catch (err) {
      console.error('Failed to update campaign:', err);
      return null;
    }
  }, [selectedCampaign]);

  const deleteCampaign = useCallback(async (id) => {
    try {
      await campaignService.delete(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  }, [selectedCampaign]);

  const value = {
    campaigns,
    selectedCampaign,
    isLoading,
    error,
    fetchCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaign must be used within a CampaignProvider');
  return context;
}; 