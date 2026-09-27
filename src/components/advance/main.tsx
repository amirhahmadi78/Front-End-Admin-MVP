import { useState } from "react";
import ArchivedPatients from "./archive/archivePatients";
import ArchivedTherapists from "./archive/archiveTherapist";
import DefaultsSettings from "./defaults/defaults";
import "./main.css"




export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('defaults');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'defaults', label: 'مقادیر پیش‌فرض', icon: '🔧' },
    { id: 'therapists', label: 'درمانگران آرشیو شده', icon: '👨‍⚕️' },
    { id: 'patients', label: 'مراجعین آرشیو شده', icon: '👤' },
  ];

 





  return (
    <div className="settings-container">
      <div className="settings-card">
        {/* هدر */}
        <div className="settings-header">
          <h1>
            <span className="settings-icon">⚙️</span>
            تنظیمات پیشرفته
          </h1>
          <p className="settings-subtitle">
            مدیریت تنظیمات سیستم و مشاهده آرشیو
          </p>
        </div>

        {/* تب‌ها */}
        <div className="tabs-navigation">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* محتوای تب‌ها */}
        <div className="tab-content-wrapper">
          {activeTab === 'defaults' && <DefaultsSettings />}
          {activeTab === 'therapists' && <ArchivedTherapists loading={loading} setLoading={setLoading} />}
          {activeTab === 'patients' && <ArchivedPatients loading={loading} setLoading={setLoading} />}
        </div>
      </div>
    </div>
  );
}