import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteDestroyPatient, DeleteDestroyTherapist, GetArchivePatients, GetArchiveTherapists, PostPatientRestore, PostTherapistRestore } from "../services/archive";
import { QueryService } from "../utils/customHooks";



export const useArchivedPatients = () => {
  return useQuery({
    queryKey: ["archivedpatients"],
    queryFn: async () => GetArchivePatients(),
    initialData: [],
  });
};


export const useDeleteDestroyPatient = () => {
     const qc = useQueryClient();
     
  return QueryService.GetMutation((priceId: string) => DeleteDestroyPatient(priceId),
{
     onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["archivedpatients"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          
          return oldData.filter(t=>t.original_id!=data.original_id)
        },
      );
    }, 
}
);
};

export const usePostRestorePatient = () => {
     const qc = useQueryClient();
  return QueryService.GetMutation((priceId: string) => PostPatientRestore(priceId),
{
     onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["archivedpatients"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
      
          
          return oldData.filter(t=>t.original_id!=data._id)
        },
      )
      qc.setQueriesData({
         queryKey: ["patientlist"],
      },(oldData: []) => {
          if (!oldData) return oldData;
          
          return [...oldData,data]
        },
    )
    }, 
}
);
};



export const useArchivedTherapists = () => {
  return useQuery({
    queryKey: ["archivedtherapists"],
    queryFn: async () => GetArchiveTherapists(),
    initialData: [],
  });
};


export const useDeleteDestroytherapist = () => {
     const qc = useQueryClient();
  return QueryService.GetMutation((priceId: string) => DeleteDestroyTherapist(priceId),
{
     onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["archivedtherapists"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          
          return oldData.filter(t=>t.original_id!=data.original_id)
        },
      );
    }, 
}
);
};

export const usePostRestoreTherapist = () => {
     const qc = useQueryClient();
  return QueryService.GetMutation((priceId: string) => PostTherapistRestore(priceId),
{
     onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["archivedtherapists"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          
          return oldData.filter(t=>t.original_id!=data._id)
        },
      )
       qc.setQueriesData({
         queryKey: ["therapists"],
      },(oldData: []) => {
          if (!oldData) return oldData;
          
          return [...oldData,data]
        },
    )
    }, 
}
);
};