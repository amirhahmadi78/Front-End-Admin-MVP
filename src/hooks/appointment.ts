import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChangeStatusDTO,
  DTOEditAppointment,
  DTOFindAppointments,
  DTONewAppointment,
} from "../types/appointment";
import {
  FindAppointment,
  PostCreateAppointment,
  PostDeleteAppointment,
  PatchEditAppointment,
  PostPublishDef,
  GetAppDetails,
  PostChangeStatus,
} from "../services/appointments";

export const useFindAppointments = (query: DTOFindAppointments) => {
  return useQuery({
    queryKey: ["appointmentslist", query],
    queryFn: () => FindAppointment(query),
    initialData: [],
    enabled: Boolean(query),
  });
};

export const useAppDetails = (appointmentId) => {
  return useQuery({
    queryKey: ["appdetails", appointmentId],
    queryFn: () => GetAppDetails(appointmentId),
    initialData: {},
    enabled: Boolean(appointmentId),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DTONewAppointment) => PostCreateAppointment(payload),

    onSuccess: (data) => {
      queryClient.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return [...oldData, data];
        },
      );
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => PostDeleteAppointment(appointmentId),

    onSuccess: (data) => {
      queryClient.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.filter((t) => t._id != data._id);
        },
      );
    },
  });
};

export const usePublishDef = () => {
  return useMutation({
    mutationFn: (date: Date) => PostPublishDef(date),
  });
};

export const useEditAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DTOEditAppointment) => PatchEditAppointment(payload),
    onSuccess: (data) => {
      queryClient.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.map((t) => (t._id == data._id ? data : t));
        },
      );
    },
  });
};

export const useChangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: ChangeStatusDTO) => PostChangeStatus(query),

    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: ["appointmentslist"] },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.map((t) => (t._id == data._id ? data : t));
        },
      );
      queryClient.setQueriesData(
        { queryKey: ["finance-apps"] },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            AppList: oldData.AppList.map((t: any) =>
              t._id === data._id ? data : t,
            ),
          };
        },
      );
     
      queryClient.setQueriesData(
        { queryKey: ["financepatient"] },
        (oldData) => {
          if (!oldData) return oldData;
          console.log(oldData);
          
          console.log(data);
          
          return {
            ...oldData,
            financialList: oldData.financialList.map((t: any) =>
              t._id === data._id ? data : t,
            ),
          };
        },
      );
    },
  });
};
