import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// Types — imported from centralized types directory, re-exported for backward compatibility
import type { LandingSection, LandingSectionProduct, LandingSectionFormData } from '../types/landing';
export type { LandingSection, LandingSectionProduct, LandingSectionFormData };

// Public hook to fetch landing sections
export const useLandingSections = () => {
  return useQuery<LandingSection[]>({
    queryKey: ["landingSections"],
    queryFn: async () => {
      const { data } = await api.get("/landing-sections");
      return data;
    },
  });
};

// Admin hooks
export const useAdminLandingSections = () => {
  return useQuery<LandingSection[]>({
    queryKey: ["adminLandingSections"],
    queryFn: async () => {
      const { data } = await api.get("/admin/landing-sections");
      return data;
    },
  });
};

export const useCreateLandingSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/admin/landing-sections", formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLandingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landing-data"] });
    },
  });
};

export const useUpdateLandingSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Need to use POST with _method for FormData in Laravel
      formData.append("_method", "PUT");
      const { data } = await api.post(`/admin/landing-sections/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLandingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landing-data"] });
    },
  });
};

export const useDeleteLandingSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/landing-sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLandingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landingSections"] });
      queryClient.invalidateQueries({ queryKey: ["landing-data"] });
    },
  });
};
