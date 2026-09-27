import { useState, useMemo } from "react";
import "./showtherapists.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TherapistTable from "./TherapistTable.js";
import TherapistModal from "./TherapistModal.js";

import {
  useEditTherapist,
  useMakeTherapist,
  useTherapists,
} from "../../hooks/therapist.js";
import type {
  DTOeditTherapist,
  DTOmakeTherapist,
} from "../../types/therapists.js";
import { ModalLoading } from "../loadingOverlay/LoadingOverlay.js";

export default function MainTherapists() {
  const [showModal, setShowModal] = useState(false);

  const [editingTherapist, setEditingTherapist] =
    useState<DTOeditTherapist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");

  const { data: therapists, isLoading: therapistLoading } = useTherapists();
  const { mutate: makeTherapist } = useMakeTherapist();
  const { mutate: editTherapist } = useEditTherapist();
  // فیلتر کردن درمانگران بر اساس جستجو
  const filteredTherapists = useMemo(() => {
    if (!searchTerm.trim()) return therapists;

    const term = searchTerm.toLowerCase().trim();

    return therapists.filter(
      (therapist: {
        firstName: unknown;
        lastName: unknown;
        phone: unknown;
        role: string;
        expertise: unknown;
      }) => {
        switch (searchField) {
          case "name":
            return `${therapist.firstName || ""} ${therapist.lastName || ""}`
              .toLowerCase()
              .includes(term);

          case "phone":
            return (therapist.phone || "").includes(term);

          case "role": {
            const roleText =
              therapist.role === "OT"
                ? "کاردرمانگر"
                : therapist.role === "SLP"
                  ? "گفتاردرمانگر"
                  : therapist.role === "PSY"
                    ? "روانشناس"
                    : therapist.role === "PT"
                      ? "فیزیوتراپیست"
                      : therapist.role === "therapist"
                        ? "درمانگر"
                        : "نامشخص";
            return roleText.includes(term);
          }

          case "expertise":
            // اگر فیلد تخصص جداگانه دارید، اینجا اضافه کنید
            return (therapist.expertise || "").toLowerCase().includes(term);

          case "all":
          default: {
            const roleTextAll =
              therapist.role === "OT"
                ? "کاردرمانگر"
                : therapist.role === "SLP"
                  ? "گفتاردرمانگر"
                  : therapist.role === "PSY"
                    ? "روانشناس"
                    : therapist.role === "PT"
                      ? "فیزیوتراپیست"
                      : therapist.role === "therapist"
                        ? "درمانگر"
                        : "نامشخص";
            return (
              `${therapist.firstName || ""} ${therapist.lastName || ""}`
                .toLowerCase()
                .includes(term) ||
              (therapist.phone || "").includes(term) ||
              roleTextAll.includes(term)
            );
          }
        }
      },
    );
  }, [therapists, searchTerm, searchField]);

  const onSubmit = (data: DTOmakeTherapist) => {
    try {
      setShowModal(false);
      if (editingTherapist == null) {
        makeTherapist(data);
      } else {
        const editData: DTOeditTherapist = {
          ...data,
          _id: editingTherapist._id,
        };
     
        editTherapist(editData);
      }

      setSearchTerm("");
    } catch (error) {
      setShowModal(false);
    }
  };

  // تابع برای پاک کردن جستجو
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchField("name");
  };

  return (
    <div className="therapists-page">
      <div className="top-bar">
        <h2>مدیریت درمانگران</h2>
        <div className="actions">
          {/* بخش جستجو */}
          <div className="search-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="جستجو بر اساس نام یا تخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              {/* انتخاب فیلد جستجو */}
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="search-select"
              >
                <option value="name">نام و نام خانوادگی</option>
                <option value="phone">شماره تماس</option>
                <option value="role">تخصص</option>
                <option value="all">همه فیلدها</option>
              </select>

              {/* دکمه پاک کردن جستجو */}
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="clear-search-btn"
                  title="پاک کردن جستجو"
                >
                  ✕
                </button>
              )}
            </div>

            {/* نمایش تعداد نتایج */}
            {searchTerm && (
              <div className="search-results-info">
                <span>
                  {filteredTherapists.length} نتیجه از {therapists.length}{" "}
                  درمانگر
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setEditingTherapist(null);
            }}
            className="add-therapist-btn"
          >
            ➕ افزودن درمانگر
          </button>
        </div>
      </div>

      {/* نمایش وضعیت بارگذاری */}
      {therapistLoading ? (
        <ModalLoading />
      ) : (
        <>
          {/* پیام عدم وجود نتیجه */}
          {searchTerm && filteredTherapists.length === 0 && (
            <div className="no-results-message">
              <p>هیچ درمانگری با جستجوی "{searchTerm}" یافت نشد.</p>
              <button onClick={handleClearSearch} className="clear-search-link">
                نمایش همه درمانگران
              </button>
            </div>
          )}

          <TherapistTable
            therapists={searchTerm ? filteredTherapists : therapists}
            setShowModal={setShowModal}
            setEditingTherapist={setEditingTherapist}
          />
        </>
      )}

      {showModal && (
        <TherapistModal
          onSubmit={onSubmit}
          onClose={() => setShowModal(false)}
          editingTherapist={editingTherapist}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
