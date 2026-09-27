import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { changePassWithPassword } from "../../services/admin";


interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Method = "current" | "otp";

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const { user, logout } = useAuth();
  const [method, setMethod] = useState<Method>("current");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");

  // خطاها
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
    otpNewPassword: "",
    otpConfirmPassword: "",
  });

  const resetForms = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setOtpNewPassword("");
    setOtpConfirmPassword("");
    setOtpSent(false);
    setErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      otpCode: "",
      otpNewPassword: "",
      otpConfirmPassword: "",
    });
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleSendOtp = async () => {
    if (!user?.phone) {
      toast.error("شماره موبایل کاربر یافت نشد");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/request-otp", { phone: user.phone });
      toast.success("کد تأیید به شماره موبایل شما ارسال شد");
      setOtpSent(true);
    } catch (error) {
      toast.error("خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWithCurrent = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      // اعتبارسنجی
      let hasError = false;
      const newErrors = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        otpCode: "",
        otpNewPassword: "",
        otpConfirmPassword: "",
      };

      if (!oldPassword) {
        newErrors.oldPassword = "رمز عبور فعلی الزامی است";
        hasError = true;
      }

      if (!newPassword) {
        newErrors.newPassword = "رمز عبور جدید الزامی است";
        hasError = true;
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "رمز عبور جدید باید حداقل ۶ کاراکتر باشد";
        hasError = true;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "تکرار رمز عبور الزامی است";
        hasError = true;
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "رمز عبور جدید و تکرار آن مطابقت ندارند";
        hasError = true;
      }

      setErrors(newErrors);

      if (hasError) {
        return;
      }

      setLoading(true);
      await changePassWithPassword(oldPassword, newPassword);
      setLoading(false);
      handleClose();

    } catch (error) {
      setLoading(false);
      handleClose();

    } finally {
      setLoading(false);
    }
  };

  const handleChangeWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("فعلا در دسترس نیست!");
    return;
  };

  if (!isOpen) return null;

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white  rounded-2xl shadow-xl w-120 p-6! relative animate-fade-in-up">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
          تغییر رمز عبور
        </h2>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setMethod("current")}
            className={`pb-2 px-4 font-medium transition-all ${
              method === "current"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            رمز فعلی دارم
          </button>
          <button
            onClick={() => setMethod("otp")}
            className={`pb-2 px-4 transition-all ${
              method === "otp"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            رمز یکبار مصرف (OTP)
          </button>
        </div>

        {method === "current" && (
          <form onSubmit={handleChangeWithCurrent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور فعلی
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.oldPassword ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.newPassword ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تکرار رمز عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
                required
                disabled={loading}
              />
            </div>

            {/* نمایش خطاها بالای دکمه */}
            {(errors.oldPassword || errors.newPassword || errors.confirmPassword) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {errors.oldPassword && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.oldPassword}
                  </p>
                )}
                {errors.newPassword && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.newPassword}
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "در حال تغییر..." : "تغییر رمز"}
            </button>
          </form>
        )}

        {method === "otp" && (
          <form onSubmit={handleChangeWithOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شماره موبایل شما
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ارسال کد یکبارمصرف"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کد تأیید
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                    placeholder="کد ۶ رقمی"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={otpNewPassword}
                    onChange={(e) => setOtpNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    type="password"
                    value={otpConfirmPassword}
                    onChange={(e) => setOtpConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "در حال تغییر..." : "تغییر رمز با کد"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};