import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeletePatient,
  Getcheckpatient,
  GetFindPatients,
  GetOnePatient,
  patientsForTherapist,
  PostEditPatient,
  PostMakePatient,
} from "../services/patients";

import type {
  DTOeditPatient,
  DTOFindPatient,
  DTOmakePatient,
} from "../types/patients";

import { AlertSwal } from "../utils/errorSwal";
import { QueryService } from "../utils/customHooks";

export const useFindPatient = (query: DTOFindPatient) => {
  return useQuery({
    queryKey: ["patientlist", query,query.days],
    queryFn:  () => GetFindPatients(query),
    
      initialData:[] ,
  });
};



export const useRefetchFindPatient = (query: DTOFindPatient) => {
  return useQuery({
    queryKey: ["patientlist", query],
    queryFn: () => GetFindPatients(query),
    initialData: [],
    enabled: false,
  });
};

export const useGetOnePatient = (patientId: string) => {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      try {
        const patient = await GetOnePatient(patientId);

        return patient;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        AlertSwal.backEndError(error,"خطا در دریافت اطلاعات این مراجع");
      }
    },
    enabled: !!patientId,
  });
};

export const useCheckPatient = (patientId: string, page: number) => {
  return QueryService.GetQuery(
    ["checkpatient", patientId, page],
    () => Getcheckpatient(patientId, page),
    { initialData: {} },
  );
};

export const useMakePatient = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (body: DTOmakePatient) => PostMakePatient(body),
    {
      onSuccess: (data) => {
        qc.setQueriesData(
          {
            queryKey: ["patientlist"],
          },
          (oldData: {patients:DTOmakePatient[]}) => {
            if (!oldData) return oldData;
        
            
            return {...oldData, patients:[data,...oldData.patients]};
          },
        );
      },
    },
  );
};

export const useEditPatient = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (payload: DTOeditPatient) => PostEditPatient(payload),
    {
      onSuccess: (data) => {
        qc.setQueriesData(
          {
            queryKey: ["patientlist"],
          },
          (oldData:{patients:DTOeditPatient[]}) => {
     

            
            if (!oldData) return oldData;


            return {...oldData,patients:oldData.patients.map((t) => (t._id == data._id ? data : t))}
          },
        );
      },
    },
  );
};

export const useDeletePatient = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation((id: string) => DeletePatient(id), {
    onSuccess: (data) => {
      qc.setQueriesData(
        { queryKey: ["patientlist"] },
        (oldData: {patients:DTOeditPatient[]}) => {
          if (!oldData) return oldData;
          return {...oldData,patients:oldData.patients.filter((t) => t._id != data._id)}
        },
      );
    },
  });
};



export const useListPatients=()=>{
    return QueryService.GetQuery(
        ["patients-fortherapist"],
        ()=>patientsForTherapist(),{
            initialData:[]
        }
    )
}