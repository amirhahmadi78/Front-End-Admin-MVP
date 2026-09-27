import React, { useState } from "react";
import CreateAdminForm from "./CreateAdminForm";
import AdminManagement from "./AdminManagement";

type TabKey = "create" | "manage";

const Admin_management: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("manage");

  return (
    <div className="flex p-10! bg-gray-100">
   
    
      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Tabs */}
        <div className=" flex justify-center p-10! border-b border-gray-300 mb-2!">
        

          <button
            className={`px-4! py-2 font-medium ${
              activeTab === "manage"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            مدیریت و بررسی کارکنان
          </button>
            <button
            className={`  px-4! py-2 font-medium ${
              activeTab === "create"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("create")}
          >
            ایجاد کارمندی جدید
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "create" && <CreateAdminForm/>}
          {activeTab === "manage" && <AdminManagement/>}
        </div>
      </main>
    </div>
  );
};

export default Admin_management;
