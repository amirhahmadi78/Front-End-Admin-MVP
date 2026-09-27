import { QueryService } from "../utils/customHooks";
import {
  Postaddpatienttotherapist,
  GetCheckRelate,
  Deleteremovepatienttotherapist,
  type payload_Relate,
  type Get_Relate,
} from "../services/patient-therapist";
import { useQueryClient } from "@tanstack/react-query";
import type { DTOeditTherapist } from "../types/therapists";
import type { DTOeditPatient } from "../types/patients";

export const useCheckRelate = (payload: Get_Relate) => {
  return QueryService.GetQuery(
    ["P-T", { patientId: payload.patientId, therapistId: payload.therapistId }],
    () => GetCheckRelate(payload),
  {enabled:Boolean(typeof payload.patientId=="string"||typeof payload.therapistId=="string")}
  );
};


export const useAddRelate = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (payload: payload_Relate) => Postaddpatienttotherapist(payload),
    {
      onSuccess: (data) => {
        qc.setQueriesData(
          {
            queryKey: ["P-T"],
          },
          (oldData: DTOeditTherapist) => {
            if (!oldData) return oldData;



            return oldData._id == data.therapist._id ? data.therapist : oldData;
          },
        );

        qc.setQueriesData(
          {
            queryKey: ["P-T"],
          },
          (oldData: DTOeditPatient) => {
            if (!oldData) return oldData;

            return oldData._id == data.patient._id ? data.patient : oldData;
          },
        );
      },
    },
  );
};


export const useRemoveRelate = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation(
    (payload: payload_Relate) => Deleteremovepatienttotherapist(payload),

    {
      onSuccess: (data) => {
        qc.setQueriesData(
          {
            queryKey: ["P-T"],
          },
          (oldData: DTOeditTherapist) => {
            if (!oldData) return oldData;
        
            return oldData._id == data.therapist._id ? data.therapist : oldData;
          },
        );

        qc.setQueriesData(
          {
            queryKey: ["P-T"],
          },
          (oldData: DTOeditPatient) => {
            if (!oldData) return oldData;

            return oldData._id == data.patient._id ? data.patient : oldData;
          },
        );
      },
    },
  );
};
