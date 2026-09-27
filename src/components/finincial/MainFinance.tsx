// MainFinance.tsx
import { useState } from "react";
import "./mainfinance.css";
import ClinicFinance from "./ClinicFinance.js";
import { useNavigate } from "react-router-dom";
import TherapistFinance from "./TherapistFinance.js";
import PatientFinance from "./PatientFinance.js";
import SalariesFinance from "./salaries/SalariesFinance.js";
import UnprocessedAppointments from "./UnprocessedAppointments.js";
import InsuranceManagement from "./bimeh/InsuranceManagement.js";

const MainFinance = () => {
  const [activeTab, setActiveTab] = useState("clinic");
  const navigate = useNavigate();

  const tabs = [
    { key: "clinic", label: "امور مالی کل کلینیک" },
    { key: "therapists", label: "امور مالی درمانگران" },
    { key: "patients", label: "امور مالی مراجعین" },
    { key: "bimeh", label: "امور مربوط به بیمه" },
    { key: "salaries", label: "حقوق ها واریزی ها" },
    { key: "unprocessed", label: "جلسات درمانی محاسبه نشده" },
  ];

  const activeTabLabel = tabs.find((t) => t.key === activeTab)?.label;

  return (
    <div className="finance-main">
      <header className="finance-topbar">
        <h2 className="finance-title">{activeTabLabel}</h2>
        <button
          type="button"
          className="return-btn"
          onClick={() => navigate("/dashboard")}
        >
          بازگشت به داشبورد اصلی
        </button>
      </header>

      <nav className="finance-tabs-wrapper">
        <ul className="finance-tabs">
          {tabs.map((tab) => (
            <li
              key={tab.key}
              className={`finance-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </nav>

      <section className="finance-content">
        {activeTab === "clinic" && <ClinicFinance />}
        {activeTab === "therapists" && <TherapistFinance />}
        {activeTab === "patients" && <PatientFinance />}
        {activeTab === "bimeh" && <InsuranceManagement />}
        {activeTab === "salaries" && <SalariesFinance />}
        {activeTab === "unprocessed" && <UnprocessedAppointments />}
      </section>
    </div>
  );
};

export default MainFinance;