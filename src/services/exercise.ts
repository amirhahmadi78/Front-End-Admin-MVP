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

export const FindExerciseById = async (
  id: string,
): Promise<IExercise> => {
  try {
    const res = await apiClient.get(`/exercises/${id}`);

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در دریافت اطلاعات تمرین!",
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

export const PatchUpdateExercise = async (
  id: string,
  query: UpdateExerciseDTO,
): Promise<IExercise> => {
  try {
    const res = await apiClient.patch(
      `/exercises/${id}`,
      query,
    );

    AlertSwal.succes(
      "تمرین با موفقیت ویرایش شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در ویرایش تمرین!",
    );

    throw error;
  }
};

export const DeleteExercise = async (
  id: string,
): Promise<{ message: string }> => {
  try {
    const res = await apiClient.delete(
      `/exercises/${id}`,
    );

    AlertSwal.succes(
      "تمرین با موفقیت حذف شد!",
    );

    return res.data;
  } catch (error) {
    AlertSwal.backEndError(
      error,
      "خطا در حذف تمرین!",
    );

    throw error;
  }
};
