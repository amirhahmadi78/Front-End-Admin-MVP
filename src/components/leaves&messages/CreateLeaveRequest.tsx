// LeaveRequestForm.jsx
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import Swal from "sweetalert2";

import "./CreateLeaveRequest.css"

import { useMakeLeaveTH } from "../../hooks/leaves";
import type { ICreateLeaveRequestDTO } from "../../types/leaves";
// API functions


// Validation schema (می‌توانید این را به فایل جداگانه منتقل کنید)
const validateLeaveRequest = (values) => {
  const errors = {};

  if (!values.user || !values.user._id) {
    errors.user = "انتخاب درمانگر الزامی است";
  }

  if (!values.type) {
    errors.type = "نوع مرخصی الزامی است";
  }

  if (!values.startDate) {
    errors.startDate = "تاریخ شروع الزامی است";
  }

  if (values.type === "daily" && !values.endDate) {
    errors.endDate = "تاریخ پایان برای مرخصی روزانه الزامی است";
  }

  if (values.type === "daily" && values.startDate && values.endDate) {
    const start = new Date(values.startDate);
    const end = new Date(values.endDate);
    if (end < start) {
      errors.endDate = "تاریخ پایان نمی‌تواند از تاریخ شروع زودتر باشد";
    }
  }

  if (values.type === "hourly") {
    if (!values.startTime) {
      errors.startTime = "زمان شروع الزامی است";
    }
    if (!values.endTime) {
      errors.endTime = "زمان پایان الزامی است";
    }
    if (values.startTime && values.endTime) {
      if (values.startTime >= values.endTime) {
        errors.endTime = "زمان پایان باید بعد از زمان شروع باشد";
      }
    }
  }

  if (!values.reason || values.reason.trim() === "") {
    errors.reason = "دلیل مرخصی الزامی است";
  } else if (values.reason.length < 3) {
    errors.reason = "دلیل مرخصی باید حداقل ۳ کاراکتر باشد";
  } else if (values.reason.length > 500) {
    errors.reason = "دلیل مرخصی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد";
  }

  return errors;
};

const LeaveRequestForm = ({ therapists, onSuccess, onCancel }) => {

  const [showTherapistList, setShowTherapistList] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      user: null,
      type: "daily",
      startDate: null,
      endDate: null,
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const watchType = watch("type");

  // Mutation for creating leave request
const{mutate:CreateLeaveTH}=useMakeLeaveTH()

  const onSubmit = async (data) => {
    // Validate form data
    const validationErrors = validateLeaveRequest(data);
    if (Object.keys(validationErrors).length > 0) {
      // Show first error
      const firstError = Object.values(validationErrors)[0];
      Swal.fire({
        title: "خطا در فرم",
        text: firstError,
        icon: "error",
        confirmButtonText: "متوجه شدم",
      });
      return;
    }


    // Prepare data for API
    const requestData:ICreateLeaveRequestDTO = {
      user: data.user._id,
      userType: "Therapist",
      therapist: data.user._id,
      type: data.type,
      startDate: data.type === "daily" 
        ? new Date(data.startDate).toISOString()
        : new Date(data.startDate).toISOString(),
      endDate: data.type === "daily" && data.endDate 
        ? new Date(data.endDate).toISOString()
        : new Date(data.startDate).toISOString(),
      reason: data.reason,
    };

    if (data.type === "hourly") {
      requestData.startTime = data.startTime;
      requestData.endTime = data.endTime;
    }


    CreateLeaveTH(requestData);
    reset()
  };


  return (
    <div className="leave-request-form-container">
      <h2>ثبت درخواست مرخصی جدید</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="leave-request-form">
        {/* Therapist Selection */}
        <div className="form-group">
          <label>درمانگر *</label>
          <div className="therapist-selector-wrapper">
            <div
              className="therapist-selector-input"
              onClick={() => setShowTherapistList(!showTherapistList)}
            >
              <input
                type="text"
                value={
                  watch("user")
                    ? `${watch("user").firstName} ${watch("user").lastName}`
                    : ""
                }
                placeholder="انتخاب درمانگر..."
                readOnly
                className={errors.user ? "error" : ""}
              />
              <span className="dropdown-icon">▼</span>
            </div>
            {showTherapistList && (
              <div className="therapist-selector-list">
                {Array.isArray(therapists) &&
                  therapists.map((therapist) => (
                    <div
                      key={therapist._id}
                      className="therapist-item"
                      onClick={() => {
                        setValue("user", therapist);
                        setShowTherapistList(false);
                      }}
                    >
                      {therapist.firstName} {therapist.lastName}
                      {therapist.role && (
                        <span className="therapist-role">
                          ({therapist.role === "psychologist"
                            ? "روانشناس"
                            : therapist.role === "psychiatrist"
                            ? "روانپزشک"
                            : therapist.role === "counselor"
                            ? "مشاور"
                            : "درمانگر"})
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {errors.user && (
            <span className="error-message">{errors.user}</span>
          )}
        </div>

        {/* Leave Type */}
        <div className="form-group">
          <label>نوع مرخصی *</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="daily"
                    checked={field.value === "daily"}
                    onChange={() => field.onChange("daily")}
                  />
                  روزانه
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="hourly"
                    checked={field.value === "hourly"}
                    onChange={() => field.onChange("hourly")}
                  />
                  ساعتی
                </label>
              </div>
            )}
          />
          {errors.type && (
            <span className="error-message">{errors.type}</span>
          )}
        </div>

        {/* Date Fields */}
        <div className="form-row">
          <div className="form-group">
            <label>تاریخ شروع *</label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date ? date.toDate() : null);
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  className={errors.startDate ? "error-datepicker" : ""}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: `1px solid ${errors.startDate ? "#dc3545" : "#cbd5e1"}`,
                    borderRadius: "8px",
                  }}
                />
              )}
            />
            {errors.startDate && (
              <span className="error-message">{errors.startDate}</span>
            )}
          </div>

          {watchType === "daily" && (
            <div className="form-group">
              <label>تاریخ پایان *</label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date ? date.toDate() : null);
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    format="YYYY/MM/DD"
                    minDate={watch("startDate")}
                    className={errors.endDate ? "error-datepicker" : ""}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: `1px solid ${errors.endDate ? "#dc3545" : "#cbd5e1"}`,
                      borderRadius: "8px",
                    }}
                  />
                )}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate}</span>
              )}
            </div>
          )}
        </div>

        {/* Time Fields for Hourly Leave */}
        {watchType === "hourly" && (
          <div className="form-row">
            <div className="form-group">
              <label>زمان شروع *</label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <input
                    type="time"
                    {...field}
                    className={errors.startTime ? "error" : ""}
                  />
                )}
              />
              {errors.startTime && (
                <span className="error-message">{errors.startTime}</span>
              )}
            </div>

            <div className="form-group">
              <label>زمان پایان *</label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <input
                    type="time"
                    {...field}
                    className={errors.endTime ? "error" : ""}
                  />
                )}
              />
              {errors.endTime && (
                <span className="error-message">{errors.endTime}</span>
              )}
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="form-group">
          <label>دلیل مرخصی *</label>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows="4"
                placeholder="لطفاً دلیل درخواست مرخصی را بنویسید..."
                className={errors.reason ? "error" : ""}
              />
            )}
          />
          {errors.reason && (
            <span className="error-message">{errors.reason}</span>
          )}
          <small className="char-counter">
            {watch("reason")?.length || 0}/500 کاراکتر
          </small>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              انصراف
            </button>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}

          >
            {isSubmitting ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
        </div>
      </form>


    </div>
  );
};

export default LeaveRequestForm;