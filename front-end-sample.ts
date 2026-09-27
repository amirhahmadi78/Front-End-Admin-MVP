
// نکات:
// از ری اکت هوک کوئری استفاده کن 
// از yup برای ولیدیشن استفاده کن در فرم
// از پیجینیشن استفاده کن و پیجینیشن رو ایمپورت کن با این ورودی ها page, setPage, totalPages 
// طراحی یو آی بر اساس دو رنگ آبی آسمانی و سبز صدری باشه  و شیک و زیبا طراحی کن
//کاملا ریسپانسیو طراحی کن


//نمونه ی تایپ ها


export const THERAPY_DOMAINS = [
  "speech",
  "sensory",
  "cognitive",
  "perceptual_motor",
  "physical",
  "education",
] as const;

export type TherapyDomain = (typeof THERAPY_DOMAINS)[number];

export const FILE_TYPES = [
  "video",
  "pdf",
  "image",
  "document",
  "audio",
  "other",

] as const;

export type ExerciseFileType = (typeof FILE_TYPES)[number];

export const DomainSubdomainMap: Record<TherapyDomain, string[]> = {
  speech: [
    "تولید و تلفظ",
    "ناروانی و لکنت",
    "زبان دریافتی",
    "زبان بیانی",
    "کاربردشناسی",
    "مهارت‌های دهانی-حرکتی و بلع",
    "صوت و حنجره",
    "توجه و تمرکز",
    "حافظه",
    "عملکردهای اجرایی",
    "مهار و کنترل تکانه",
  ],

  sensory: [
    "حس لامسه",
    "حس عمقی",
    "حس تعادلی",
    "حس بینایی",
    "حس شنوایی",
    "درون‌حسی",
    "تعدیل و تنظیم حسی",
  ],

  cognitive: [
    "توجه و تمرکز",
    "حافظه",
    "عملکردهای اجرایی",
    "مهار و کنترل تکانه",
    "ادراک و تفکر منطقی",
    "شناخت اجتماعی و هیجانی",
  ],

};

export interface IDomainSelection {
  domain: TherapyDomain;
  subdomains: string[];
}

export interface IExerciseFile {
  _id?: string;
  fileURLs?: string;
  fileType?: ExerciseFileType;
}




//نمونه ی سرویس ها
import apiClient from "../api/client";

import type {
  CreateExerciseDTO,
  DTOFindExercises,
  IExercise,
  UpdateExerciseDTO,
} from "../types/exercises";

import { AlertSwal } from "../utils/errorSwal";

export const FindExercises = async (
  query?: DTOFindExercises,
): Promise<IExercise[]> => {
  try {
    const res = await apiClient.get("/exercises", {
      params: query,
    });

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در دریافت لیست تمرین‌ها!",
    );

    throw error;
  }
};



export const PostCreateExercise = async (
  query: CreateExerciseDTO,
): Promise<IExercise> => {
  try {
    const res = await apiClient.post(
      "/exercises",
      query,
    );

    AlertSwal.succes(
      "تمرین با موفقیت ایجاد شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در ایجاد تمرین!",
    );

    throw error;
  }
};



//نمونه ی کاستوم هوک ها
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  DeleteExercise,
  FindExerciseById,
  FindExercises,
  PatchUpdateExercise,
  PostCreateExercise,
} from "../services/exercise";

import type {
  CreateExerciseDTO,
  DTOFindExercises,
  IExercise,
  UpdateExerciseDTO,
} from "../types/exercises";

interface UpdateExerciseMutationPayload {
  id: string;
  data: UpdateExerciseDTO;
}

export const useFindExercises = (
  query?: DTOFindExercises,
) => {
  return useQuery({
    queryKey: ["exerciseslist", query],
    queryFn: () => FindExercises(query),
    initialData: [],
  });
};

export const useFindExerciseById = (
  id?: string,
) => {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => FindExerciseById(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      query: CreateExerciseDTO,
    ) => PostCreateExercise(query),

    onSuccess: (data) => {
      queryClient.setQueriesData<IExercise[]>(
        {
          queryKey: ["exerciseslist"],
        },
        (oldData) => {
          if (!oldData) {
            return [data];
          }

          return [data, ...oldData];
        },
      );
    },
  });
};