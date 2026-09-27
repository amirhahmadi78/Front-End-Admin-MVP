

export const assessmentResultKeys = {
  all: ['assessment-results'] as const,
  lists: () => [...assessmentResultKeys.all, 'list'] as const,
  list: (params?: ListAssessmentResultsParams) =>
    [...assessmentResultKeys.lists(), params ?? {}] as const,
  details: () => [...assessmentResultKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentResultKeys.details(), id] as const,
};


import { useQuery, useQueryClient } from '@tanstack/react-query';


import type {  AssessmentResultListResponse } from '../types/assessmentResult.types';
import type {
  CreateAssessmentResultPayload,
  SubmitAssessmentResultPayload,
  UpdateAssessmentResultPayload,
  ListAssessmentResultsParams,
} from '../types/assessmentResult.types';

import { QueryService } from '../utils/customHooks';
import { AssessmentResultApi } from '../services/assessmentResult';

const emptyList: AssessmentResultListResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
};

/** لیست با فیلتر */
export const useAssessmentResultsList = (
  params?: ListAssessmentResultsParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: assessmentResultKeys.list(params),
    queryFn: () => AssessmentResultApi.list(params),
    enabled: options?.enabled ?? true,
    placeholderData: (prev) => prev ?? emptyList,
  });
};

/** جزئیات یک نتیجه */
export const useAssessmentResultById = (
  id: string | undefined,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: assessmentResultKeys.detail(id ?? ''),
    queryFn: () => AssessmentResultApi.ById(id!),
    enabled: (options?.enabled ?? true) && Boolean(id),
  });
};

/** ایجاد (معمولاً in-progress) */
export const useCreateAssessmentResult = () => {
  const qc = useQueryClient();

  return QueryService.GetMutation(
    (payload: CreateAssessmentResultPayload) => AssessmentResultApi.create(payload),
    {
      onSuccess: (data) => {
        qc.setQueriesData<AssessmentResultListResponse>(
          { queryKey: assessmentResultKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: [data, ...old.data],
              total: old.total + 1,
            };
          },
        );
        qc.setQueryData(assessmentResultKeys.detail(data._id), data);
      },
    },
  );
};

/** PATCH — یادداشت، توضیح، status */
export const useUpdateAssessmentResult = () => {
  const qc = useQueryClient();

  return QueryService.GetMutation(
    ({ id, payload }: { id: string; payload: UpdateAssessmentResultPayload }) =>
      AssessmentResultApi.update(id, payload),
    {
      onSuccess: (data) => {
        qc.setQueryData(assessmentResultKeys.detail(data._id), data);
        qc.setQueriesData<AssessmentResultListResponse>(
          { queryKey: assessmentResultKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((item) =>
                item._id === data._id ? data : item,
              ),
            };
          },
        );
      },
    },
  );
};

/** ثبت نهایی + پاسخ‌ها */
export const useSubmitAssessmentResult = () => {
  const qc = useQueryClient();

  return QueryService.GetMutation(
    ({ id, payload }: { id: string; payload: SubmitAssessmentResultPayload }) =>
      AssessmentResultApi.submit(id, payload),
    {
      onSuccess: (data) => {
        qc.setQueryData(assessmentResultKeys.detail(data._id), data);
        qc.setQueriesData<AssessmentResultListResponse>(
          { queryKey: assessmentResultKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((item) =>
                item._id === data._id ? data : item,
              ),
            };
          },
        );
      },
    },
  );
};

/** لغو */
export const useCancelAssessmentResult = () => {
  const qc = useQueryClient();

  return QueryService.GetMutation((id: string) => AssessmentResultApi.cancel(id), {
    onSuccess: (data) => {
      qc.setQueryData(assessmentResultKeys.detail(data._id), data);
      qc.setQueriesData<AssessmentResultListResponse>(
        { queryKey: assessmentResultKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item._id === data._id ? data : item,
            ),
          };
        },
      );
    },
  });
};

/** حذف */
export const useDeleteAssessmentResult = () => {
  const qc = useQueryClient();

  return QueryService.GetMutation(
    (id: string) => AssessmentResultApi.delete(id).then(() => id),
    {
      onSuccess: (deletedId) => {
        qc.removeQueries({
          queryKey: assessmentResultKeys.detail(deletedId),
        });
        qc.setQueriesData<AssessmentResultListResponse>(
          { queryKey: assessmentResultKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((item) => item._id !== deletedId),
              total: Math.max(0, old.total - 1),
            };
          },
        );
      },
    },
  );
};

export const useAssessmentResultsDetails=(id:string)=>{
  return QueryService.GetQuery(
    ["assessment-details",id],
    ()=>AssessmentResultApi.details(id),
    {enabled:false}
  )
}