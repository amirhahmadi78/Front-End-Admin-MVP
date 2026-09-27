import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PatchChangegroupStatus,
  PatchUpdateGroup,
  PostAddGroup,
  PostGroupPayment,
  PostRemoveGroupPayment,
} from "../services/GroupAppointment";

export const useCreateGroup = () => {
  const queryCient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => PostAddGroup(payload),

    onSuccess: () => {
      queryCient.invalidateQueries({
        queryKey: ["appointmentslist"],
      });
    },
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => PatchUpdateGroup(payload),

    onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
     

          if (!oldData) return oldData;
          return oldData.map((t) =>
            t._id == data.updatedGroup._id ? data.updatedGroup : t,
          );
        },
      );
    },
  });
};

export const useChangeGroupStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => PatchChangegroupStatus(payload),

    onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.map((t) =>
            t._id == data.result._id ? data.result : t,
          );
        },
      );
    },
  });
};

export const useGroupPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => PostGroupPayment(payload),

    onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.map((t) =>
            t._id == data.result._id ? data.result : t,
          );
        },
      );
    },
  });
};

export const useRemoveGroupPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => PostRemoveGroupPayment(payload),

    onSuccess: (data) => {
        console.log(data);
        
      qc.setQueriesData(
        {
          queryKey: ["appointmentslist"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          return oldData.map((t) =>
            t._id == data.result._id ? data.result : t,
          );
        },
      );
    },
  });
};
