import { useFindPatient } from "../../hooks/patient";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Pagination2 from "../util/pagination2";

export const MainPatientProfile = () => {
  const { data } = useFindPatient({});
 
  
  const patients = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // تعداد آیتم در هر صفحه

  // فیلتر بر اساس جستجو (نام، نام‌خانوادگی یا ترکیب)
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.trim().toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term),
    );
  }, [patients, searchTerm]);

  // محاسبات صفحه‌بندی
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // بازنشانی به صفحه اول هنگام جستجو
  };

  return (
    <div className="min-h-screen   from-slate-50 via-white to-blue-50 px-2! py-8! rtl">
      <div className="mx-auto  ">
        {/* Header */}
        <div className="mb-3! flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-blue-100/40 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div className="flex! mt-10! justify-between ">
            <h1 className="text-3xl text-center! p-y3! font-extrabold text-gray-800">
              لیست مراجعین
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600  text-white rounded-xl m-1! p-2!"
            >
              بازگشت
            </button>
          </div>

          <div className="relative w-full py-3! md:w-80">
            <input
              type="text"
              placeholder="جستجوی نام یا نام خانوادگی..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-xl! border border-gray-200 bg-white/90 py-3! pr-11! pl-4 text-sm text-gray-700 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Patients List */}
        {currentPatients.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 px-6 py-16! text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <svg
                className="h-8 w-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-10a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700">مراجعی پیدا نشد</h3>
            <p className="mt-2 text-sm text-gray-500">
              عبارت جستجو را تغییر بده یا بعداً دوباره بررسی کن.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {currentPatients.map((patient) => (
              <div
                key={patient._id}
                onClick={() => navigate(`/patientprofile/${patient._id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-1! shadow-md shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white shadow-md">
                      {patient.firstName?.[0]}
                      {patient.lastName?.[0]}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
                        {patient.firstName} {patient.lastName}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-full bg-blue-50 p-2 text-blue-400 transition-all duration-200 group-hover:bg-blue-100 group-hover:text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination2 page={currentPage} setPage={setCurrentPage} totalPages={totalPages}/>
        


      </div>
    </div>
  );
};
