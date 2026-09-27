import "./Layout.css";
import {  Outlet, useNavigate } from "react-router-dom";
// import { logoutAdmin } from "../../api/auth";

// import { GetPendingLeaveRequestsCount } from "../../api/adminpanel";

import Swal from "sweetalert2";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { ChangePasswordModal } from "../util/changePasword";
import { useLeavesCount } from "../../hooks/leaves";





const LayoutDashboard = () => {
  const{user,logout}=useAuth()

  
const fullName=(user?.firstName+" "+user?.lastName)||""
const [showModalChange,setShowModalChange]=useState(false)
const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const{data:pendingCount}=useLeavesCount()

  const handleLogout = () => {
    Swal.fire({
      title: "آیا اطمینان دارید؟",
      text: "برای خروج از حساب کاربری تایید کنید!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "تایید",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        logout().then(() => {
          Swal.fire({
            title: "خروج موفق!",
            text: "با موفقیت خارج شدید!",
            icon: "success",
          });
          navigate("/");
        });
      }
    });
  };

  return (
    <div className={`admin-layout ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
      <aside className={`admin-sidebar ${!isSidebarOpen ? "closed" : ""}`}>
        <div className="sidebar-header p-1! ">
          <button
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
            
          
        </div>

        {isSidebarOpen && (
          <>
          <div className="flex-col! text-center!">
 <p className="min-w-45 mx-2! p-1!  text-center mb-1 border-purple-400 border-2 rounded-xl bg-blue-900  text"> کاربر فعال :{fullName}</p>
          <button onClick={()=>setShowModalChange(true)} className="min-w-45 mx-2! p-1! mb-3!  border-purple-400 border-2 rounded-xl bg-blue-800  text">تغییر رمز عبور</button>
           
          </div>
         
            <button onClick={handleLogout} className="logout-btn">
              خروج از حساب
            </button>
            <ul className="pb-20!">
              <li onClick={() => {navigate("/dashboard")
                setIsSidebarOpen(false)
              }}>داشبورد</li>
              <li onClick={() => {navigate("/therapists")
                setIsSidebarOpen(false)
              }}>
                درمانگران
              </li>
              <li onClick={() => {navigate("/patients")
                setIsSidebarOpen(false)
              }}>مراجعین</li>
              <li onClick={() => {navigate("/weeklydef")
                setIsSidebarOpen(false)
              }}>
                برنامه ثابت هفتگی
              </li>
              <li onClick={() => {navigate("/patient-therapist")
                setIsSidebarOpen(false)
              }}>
                ارتباط درمانگر و مراجع
              </li>
                      <li onClick={() => {navigate("/patientprofile")
                setIsSidebarOpen(false)
              }}>
                پرونده ی درمانی
              </li>
           
              <li onClick={() => {navigate("/exercise-assessment")
                setIsSidebarOpen(false)
              }}> بخش تمرینات و ارزیابی ها</li>
              <li onClick={() => {navigate("/finance")
                setIsSidebarOpen(false)
              }}>امور مالی</li>
                         
              <li onClick={() => {navigate("/leave-requests")
                setIsSidebarOpen(false)
              }}>
                بررسی مرخصی های درمانگران
                {pendingCount > 0 && (
                  <span className="pending-badge">{pendingCount}</span>
                )}
              </li>
              <li onClick={() => {navigate("/patient-management")
                setIsSidebarOpen(false)
              }}>
                یادداشت ها و مرخصی مراجعین
              </li>
            { user?.role==="Admin"&& <li onClick={() => {navigate("/advance")
                setIsSidebarOpen(false)
              }}>
                تنظیمات پیشرفته
              </li>}
                  {user?.role==="Admin"&& <li onClick={() => {navigate("/adminmanagement")
                    setIsSidebarOpen(false)
                  }}>
                مدیریت کارکنان
              </li>}
               <button
            className=" p-1! w-50! rounded-xl bg-blue-300 text-black font-bold border  mt-3!"
            onClick={() => {window.location.reload()
              setIsSidebarOpen(false)
            }}
          >
            بروزرسانی
          </button>
            </ul>
          </>
        )}
      </aside>

      <main className="admin-main">
        {!isSidebarOpen && (
          <button
            className="floating-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>
        )}
        <Outlet />
      </main>
      <ChangePasswordModal isOpen={showModalChange} onClose={setShowModalChange}/>
    </div>
  );
};

export default LayoutDashboard;
