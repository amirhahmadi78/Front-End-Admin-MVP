import { useMemo, useState, useEffect } from "react";
import "./main.css";

import { useFindPatient } from "../../hooks/patient";
import { useTherapists } from "../../hooks/therapist";
import {
  useAddRelate,
  useCheckRelate,
  useRemoveRelate,
} from "../../hooks/patient-therapist";
import type { Get_Relate } from "../../services/patient-therapist";
import Pagination from "../util/pagination";

const MainPatient_Therapist = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState<"patients" | "therapists">("patients");
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");
  const [querySearch, setQuerySearch] = useState<any>({});
  const [payload, setPayload] = useState<Get_Relate>({
    therapistId: 1,
    patientId: 1
  });
  const [addSearchTerm, setAddSearchTerm] = useState("");

  // ✅ استفاده از querySearch برای جستجو با پیجینیشن
// در MainPatient_Therapist
const { 
  data: patientsData, 
  isLoading: isLoadingPatients,
  refetch: refetchPatients 
} = useFindPatient({ 
  ...querySearch,
  page: Number(page),    // ✅ تبدیل به عدد
  limit: Number(limit)   // ✅ تبدیل به عدد
});

const { 
  data: therapistsData, 
  isLoading: isLoadingTherapists,
  refetch: refetchTherapists 
} = useTherapists({ 
  ...querySearch,
  page: Number(page),    // ✅ تبدیل به عدد
  limit: Number(limit)   // ✅ تبدیل به عدد
});
  const { mutate: AddRelate } = useAddRelate();
  const { data: selectedItem, refetch: refetchSelected } = useCheckRelate(payload);
  const { mutate: RemoveRelate } = useRemoveRelate();


  // ✅ داده‌های جاری بر اساس تب فعال
  const currentData = activeTab === "patients" ? patientsData : therapistsData;
  const currentList = currentData?.data || currentData?.therapists || currentData?.patients || [];
  const totalPages = currentData?.totalPages || 1;
  const total = currentData?.total || 0;

  // ✅ لیست برای اضافه کردن رابطه (بدون پیجینیشن - همه آیتم‌ها)
  const { data: allPatients } = useFindPatient({});
  const { data: allTherapists } = useTherapists({});

  const addFilteredList = useMemo(() => {
    const list = activeTab === "patients" ? allTherapists : allPatients;
    if (Array.isArray(list)) {
      return list.filter((p) =>
        (p.firstName + " " + p.lastName)
          .toLowerCase()
          .includes(addSearchTerm.toLowerCase())
      );
    }
    return [];
  }, [addSearchTerm, activeTab, allPatients, allTherapists]);

  // ✅ جستجو با firstName و lastName
  const handleSearch = () => {
    setPage(1); // رفتن به صفحه اول
    const searchQuery: any = {};
    
    if (searchFirstName.trim()) {
      searchQuery.firstName = searchFirstName.trim();
    }
    if (searchLastName.trim()) {
      searchQuery.lastName = searchLastName.trim();
    }
    
    setQuerySearch(searchQuery);
  };

  // ✅ پاک کردن جستجو
  const handleClearSearch = () => {
    setSearchFirstName("");
    setSearchLastName("");
    setQuerySearch({});
    setPage(1);
  };

  // ✅ جستجو با Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ✅ اضافه کردن رابطه
  const handleAddRelation = (item: any) => {
    if (!selectedItem) return;

    const patientId = activeTab === "patients" ? selectedItem?._id : item._id;
    const therapistId = activeTab === "patients" ? item._id : selectedItem?._id;

    AddRelate(
      { patientId, therapistId },
      {
        onSuccess: () => {
          refetchSelected(); // رفرش کردن رابطه
          if (activeTab === "patients") {
            refetchPatients(); // رفرش لیست بیماران
          } else {
            refetchTherapists(); // رفرش لیست درمانگران
          }
          setAddSearchTerm(""); // پاک کردن جستجو
        },
      }
    );
  };

  // ✅ حذف رابطه
  const handleRemoveRelation = (item: any) => {
    const patientId = activeTab === "patients" ? selectedItem._id : item._id;
    const therapistId = activeTab === "patients" ? item._id : selectedItem._id;

    RemoveRelate(
      { patientId, therapistId },
      {
        onSuccess: () => {
          refetchSelected(); // رفرش کردن رابطه
          if (activeTab === "patients") {
            refetchPatients(); // رفرش لیست بیماران
          } else {
            refetchTherapists(); // رفرش لیست درمانگران
          }
        },
      }
    );
  };

  // ✅ بررسی رابطه
  const handleCheckRelate = async (item: any) => {
    let therapistId = 1;
    let patientId = 1;

    if (item.modeluser === "Therapist") {
      therapistId = item._id;
      patientId = 1;
    } else if (item.modeluser === "Patient") {
      therapistId = 1;
      patientId = item._id;
    }

    setPayload({
      therapistId,
      patientId,
    });
  };

  // ✅ تغییر تب
  const handleTabChange = (tab: "patients" | "therapists") => {
    setActiveTab(tab);
    setPage(1);
    setQuerySearch({});
    setSearchFirstName("");
    setSearchLastName("");
    setPayload({
      therapistId: 1,
      patientId: 1,
    });
  };

  // ✅ رفرش مجدد وقتی صفحه یا query تغییر می‌کند
  useEffect(() => {
    if (activeTab === "patients") {
      refetchPatients();
    } else {
      refetchTherapists();
    }
  }, [page, querySearch, activeTab]);

  const isLoading = activeTab === "patients" ? isLoadingPatients : isLoadingTherapists;

  return (
    <div className="assign-container">
      <h2>مدیریت ارتباط مراجعین و درمانگران</h2>

      <div className="tabs">
        <button
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => handleTabChange("patients")}
        >
          بر اساس مراجع
        </button>
        <button
          className={activeTab === "therapists" ? "active" : ""}
          onClick={() => handleTabChange("therapists")}
        >
          بر اساس درمانگر
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder={
            activeTab === "patients" ? "نام مراجع..." : "نام درمانگر..."
          }
          value={searchFirstName}
          onChange={(e) => setSearchFirstName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <input
          type="text"
          placeholder={
            activeTab === "patients"
              ? "نام خانوادگی مراجع..."
              : "نام خانوادگی درمانگر..."
          }
          value={searchLastName}
          onChange={(e) => setSearchLastName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          🔍 جستجو
        </button>
        {(searchFirstName || searchLastName) && (
          <button onClick={handleClearSearch} className="clear-search-btn">
            ✕ پاک کردن
          </button>
        )}
      </div>

      {/* نمایش وضعیت بارگذاری */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      ) : (
        <>
          {/* نمایش تعداد نتایج */}
          <div className="results-info">
            <span>
              {currentList.length} نتیجه از {total} 
              {activeTab === "patients" ? " مراجع" : " درمانگر"}
            </span>
          </div>

          {/* لیست آیتم‌ها */}
          <div className="list-section">
            {currentList.length === 0 ? (
              <div className="no-results">
                <p>هیچ موردی یافت نشد.</p>
                {(searchFirstName || searchLastName) && (
                  <button onClick={handleClearSearch} className="clear-search-link">
                    نمایش همه
                  </button>
                )}
              </div>
            ) : (
              currentList.map((item: any) => (
                <div
                  key={item._id}
                  className={`list-item ${
                    selectedItem?._id === item._id ? "active" : ""
                  }`}
                  onClick={() => handleCheckRelate(item)}
                >
                  {item.firstName} {item.lastName}
                  {item.phone && <span className="item-phone"> - {item.phone}</span>}
                </div>
              ))
            )}
          </div>

          {/* پیجینیشن */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
        </>
      )}

      {/* بخش روابط */}
      {selectedItem && (selectedItem.therapists?.length > 0 || selectedItem.patients?.length > 0 || true) && (
        <div className="relation-section">
          <h3>
            {activeTab === "patients"
              ? `درمانگران ${selectedItem.firstName} ${selectedItem.lastName}`
              : `مراجعین ${selectedItem.firstName} ${selectedItem.lastName}`}
          </h3>

          {/* لیست روابط موجود */}
          <ul className="relation-list">
            {(activeTab === "patients"
              ? selectedItem.therapists || []
              : selectedItem.patients || []
            ).length === 0 ? (
              <li className="relation-item empty">
                <span>هیچ ارتباطی ثبت نشده است</span>
              </li>
            ) : (
              (activeTab === "patients"
                ? selectedItem.therapists || []
                : selectedItem.patients || []
              ).map((r: any, index: number) => (
                <li key={index} className="relation-item">
                  <span>
                    {r.firstName} {r.lastName}
                    {r.phone && <span className="relation-phone"> - {r.phone}</span>}
                  </span>
                  <button
                    onClick={() => handleRemoveRelation(r)}
                    className="remove-btn"
                  >
                    حذف
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* افزودن رابطه جدید */}
          <div className="add-relation">
            <div className="add-relation-input-wrapper">
              <input
                type="text"
                placeholder={
                  activeTab === "patients"
                    ? "جستجوی درمانگر جدید..."
                    : "جستجوی مراجع جدید..."
                }
                className="add-input"
                value={addSearchTerm}
                onChange={(e) => setAddSearchTerm(e.target.value)}
              />
              {addSearchTerm && addFilteredList.length > 0 && (
                <ul className="add-dropdown">
                  {addFilteredList.map((p: any) => (
                    <li
                      key={p._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddRelation(p);
                      }}
                      className="dropdown-item"
                    >
                      {p.firstName} {p.lastName}
                      {p.phone && <span className="dropdown-phone"> - {p.phone}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPatient_Therapist;