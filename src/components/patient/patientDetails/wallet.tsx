import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import "./wallet.css";

import { useWalletDeposit, useWalletwithdraw } from "../../../hooks/transaction";
import { useRefetchFindPatient } from "../../../hooks/patient";




export default function WalletTransaction({ walletModal, setWalletModal, }) {
  

  
  
  
  const [transactionType, setTransactionType] = useState("deposit");
const{data:patient,refetch}=useRefetchFindPatient({_id:walletModal._id})
  const currentBalance = patient?.[0]?.wallet ?? 0;

  
const {mutate:PostWalletDeposit,isPending:depoLoading}=useWalletDeposit()
const {mutate:PostWalletwithdraw,isPending:withdrawLoading}=useWalletwithdraw()
const loading=depoLoading||withdrawLoading
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger
  } = useForm({
    defaultValues: {
      amount: "",
      description: ""
    }
  });

  const watchedAmount = watch("amount");

  // لود موجودی فعلی
  useEffect(() => {
    if (walletModal?._id) {
      // setCurrentBalance(walletModal.wallet || 0);
      refetch()
    }
  }, [walletModal]);

  // چک کردن موجودی کافی برای برداشت
  useEffect(() => {
    if (transactionType === "withdraw" && watchedAmount) {
      const amount = parseInt(watchedAmount);
      if (amount > currentBalance) {
        setValue("amount", currentBalance.toString());
        trigger("amount");
      }
    }
  }, [transactionType, watchedAmount, currentBalance, setValue, trigger]);

  const onSubmit = async (data) => {
    const amount = parseInt(data.amount);
    
    // چک نهایی موجودی برای برداشت
    if (transactionType === "withdraw" && amount > currentBalance) {
      Swal.fire("خطا!", "موجودی کافی نیست", "error");
      return;
    }



       const payload={
            patientId: walletModal._id,
          amount: amount,
          description: data.description || 
            `${transactionType === "deposit" ? "واریز" : "برداشت"} دستی - ${amount.toLocaleString()} تومان`
        }
        if (transactionType=="deposit"){
       PostWalletDeposit(payload)
     

      
        handleClose();
       
     
 
 
        }else{
           PostWalletwithdraw(payload)

handleClose()
        }
      
   

     
  

 
  };

  const handleClose = () => {
    setWalletModal(false);
    reset();
    setTransactionType("deposit");
  };

  // پیشنهاد مبلغ‌های سریع
  const quickAmounts = [50000, 100000, 200000, 500000];

  if (!walletModal) return null;

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <button className="wallet-modal-close" onClick={handleClose}>
          ×
        </button>
        
        <h2 className="wallet-modal-title">
          مدیریت کیف پول {walletModal.firstName} {walletModal.lastName}
        </h2>
        
        <div className="wallet-info-card">
          <div className="wallet-balance-label">موجودی فعلی</div>
          <div className="wallet-balance-amount">
            {currentBalance.toLocaleString()} تومان
          </div>
        </div>

        <form className="wallet-form" onSubmit={handleSubmit(onSubmit)}>
          {/* انتخاب نوع تراکنش */}
          <div className="form-group">
            <label className="form-label">نوع تراکنش:</label>
            <div className="transaction-type-group">
              <label className="transaction-type-label">
                <input
                  type="radio"
                  value="deposit"
                  checked={transactionType === "deposit"}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="transaction-type-radio"
                />
                <div className={`transaction-type-button transaction-type-deposit ${
                  transactionType === "deposit" ? "selected" : ""
                }`}>
                  ➕ افزایش موجودی
                </div>
              </label>
              <label className="transaction-type-label">
                <input
                  type="radio"
                  value="withdraw"
                  checked={transactionType === "withdraw"}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="transaction-type-radio"
                />
                <div className={`transaction-type-button transaction-type-withdraw ${
                  transactionType === "withdraw" ? "selected" : ""
                }`}>
                  ➖ کاهش موجودی
                </div>
              </label>
            </div>
          </div>

          {/* مبلغ */}
          <div className="form-group">
            <label className="form-label">مبلغ (تومان):</label>
            <input
              type="number"
              {...register("amount", {
                required: "لطفا مبلغ را وارد کنید",
                min: {
                  value: 1000,
                  message: "حداقل مبلغ ۱,۰۰۰ تومان است"
                },
                max: {
                  value: 100000000,
                  message: "حداکثر مبلغ ۱۰۰,۰۰۰,۰۰۰ تومان است"
                },
                validate: {
                  sufficientBalance: (value) => 
                    transactionType !== "withdraw" || 
                    parseInt(value) <= currentBalance || 
                    "موجودی کافی نیست"
                }
              })}
              placeholder="مبلغ را وارد کنید"
              className={`form-input ${errors.amount ? "error" : ""}`}
            />
            {errors.amount && (
              <p className="error-message">{errors.amount.message}</p>
            )}
          </div>

          {/* مبلغ‌های سریع */}
          <div className="form-group">
            <label className="quick-amounts-label">مبلغ‌های سریع:</label>
            <div className="quick-amounts-group">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setValue("amount", amount.toString())}
                  className="quick-amount-button"
                >
                  {amount.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setValue("amount", currentBalance.toString())}
                className="quick-amount-button quick-amount-all"
              >
                همه موجودی
              </button>
            </div>
          </div>

          {/* توضیحات */}
          <div className="form-group">
            <label className="form-label">توضیحات (اختیاری):</label>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "توضیحات نباید بیشتر از ۲۰۰ کاراکتر باشد"
                }
              })}
              placeholder="توضیحات تراکنش"
              className={`form-textarea ${errors.description ? "error" : ""}`}
            />
            {errors.description && (
              <p className="error-message">{errors.description.message}</p>
            )}
          </div>

          {/* خلاصه تراکنش */}
          {watchedAmount && parseInt(watchedAmount) > 0 && (
            <div className="transaction-summary">
              <div className="transaction-summary-title">خلاصه تراکنش:</div>
              <div className="transaction-summary-item">
                <span className="transaction-summary-label">مبلغ:</span>
                <span className="transaction-summary-value">
                  {parseInt(watchedAmount).toLocaleString()} تومان
                </span>
              </div>
              <div className="transaction-summary-item">
                <span className="transaction-summary-label">نوع:</span>
                <span className="transaction-summary-value">
                  {transactionType === "deposit" ? "افزایش موجودی" : "کاهش موجودی"}
                </span>
              </div>
              <div className="transaction-summary-item">
                <span className="transaction-summary-label">موجودی جدید:</span>
                <span className={`transaction-summary-value ${
                  transactionType === "deposit" ? "transaction-summary-positive" : "transaction-summary-negative"
                }`}>
                  {(
                    transactionType === "deposit" 
                      ? currentBalance + parseInt(watchedAmount)
                      : currentBalance - parseInt(watchedAmount)
                  ).toLocaleString()} تومان
                </span>
              </div>
            </div>
          )}

          {/* دکمه‌های اقدام */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`submit-button ${
                transactionType === "deposit" ? "submit-button-deposit" : "submit-button-withdraw"
              }`}
            >
              {loading ? (
                <>
                  در حال ثبت
                  <span className="loading-spinner"></span>
                </>
              ) : (
                transactionType === "deposit" ? "افزایش موجودی" : "کاهش موجودی"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}