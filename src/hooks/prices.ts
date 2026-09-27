import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeletePrice,
  GetPriceAll,
  PostPriceUpdate,
  PostRefresh,
} from "../services/prices";
import { QueryService } from "../utils/customHooks";

export const useDefaultPrices = () => {
  return useQuery({
    queryKey: ["defaultPrices"],
    queryFn: async () => GetPriceAll(),
    initialData: [],
  });
};

export const usePostPrice = () => {
  const qc = useQueryClient();
  return QueryService.GetMutation((query) => PostPriceUpdate(query), {
    onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["defaultPrices"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          const newData=oldData.filter((t) => t._id != data._id);
          return [...newData, data];
        },
      );
    },
  });
};

export const useDeletePrice = () => {
     const qc = useQueryClient();
  return QueryService.GetMutation((priceId: string) => DeletePrice(priceId),
{
     onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["defaultPrices"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          
          return oldData.filter(t=>t._id!=data._id)
        },
      );
    }, 
}
);
};

export const usePostRefreshPrice = () => {
      const qc = useQueryClient();
  return QueryService.GetMutation(() => PostRefresh(),

{
   onSuccess: (data) => {
      qc.setQueriesData(
        {
          queryKey: ["defaultPrices"],
        },
        (oldData: []) => {
          if (!oldData) return oldData;
          
          return data
        },
      );
    }, 
})
};
