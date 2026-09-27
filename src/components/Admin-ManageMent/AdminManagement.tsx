import React from "react";

import { useDeleteAdmin, useFindAdmins } from "../../hooks/admin";
import { DeleteAdmin } from "../../services/admin";
import { AlertSwal } from "../../utils/errorSwal";



// دیکشنری ترجمه نقش‌ها
const roleTranslations: Record<string, string> = {
  internalManager: "مدیر داخلی",
  Admin: "ادمین اصلی",
  secretary: "منشی",
  accountant: "حسابدار",
};

const AdminManagement: React.FC = () => {

  const { data, isLoading, error } = useFindAdmins();
const{mutate:deletAdmin ,isPending,}=useDeleteAdmin()

const deleteHandler=async(_id:string,firstName,lastName)=>{
  const res=await AlertSwal.doYouWant(`آیا از حذف ${firstName} ${lastName} مطمئن هستید؟`)
  if(res.isConfirmed){
    deletAdmin(_id)
  }
}
  if (isLoading) return <div className="text-center py-10">در حال بارگذاری...</div>;
  if (error) return <div className="text-center py-10 text-red-500">خطا در دریافت اطلاعات</div>;

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">مدیریت و بررسی کارکنان</h2>

      <div className="grid gap-4">
        {data?.map((admin: any) => (
          <div
            key={admin._id}
            className="flex items-center justify-between bg-white border border-gray-200 p-5 rounded-xl hover:shadow-lg transition-all duration-300 group"
          >
            {/* اطلاعات کاربر */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg text-gray-800">
                  {admin.firstName} {admin.lastName}
                </p>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  {roleTranslations[admin.role as keyof typeof roleTranslations] || admin.role}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-gray-500">
                <span>📧 {admin.email}</span>
                <span>📱 {admin.phone}</span>
              </div>
            </div>

            {/* دکمه حذف */}
            <button
              onClick={() => deleteHandler(admin._id,admin.firstName,admin.lastName)}
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2 rounded-lg font-medium transition-colors"
              disabled={isPending}
            >
              {isPending ? "در حال حذف..." : "حذف"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManagement;
