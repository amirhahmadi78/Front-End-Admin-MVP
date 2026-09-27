import moment from "moment-jalaali";
import { useGetTherapistBalance } from "../../../hooks/finance";
import { useEffect, useRef } from "react";

const PersonFinanceBox = ({ 
  name, 
  userId, 
  transactions, 
  YYYYMM, 
  onBalanceFetched   // ✅ دریافت تابع callback به جای setDetails مستقیم
}) => {
  const { data } = useGetTherapistBalance({ 
    userId, 
    YYYYMM 
  });

  // ✅ جلوگیری از تماس تکراری onBalanceFetched برای داده یکسان
  const lastNotifiedDataRef = useRef(null);



  useEffect(() => {
    //只有当 data 存在且与上次通知的数据不同时才调用
    if (data && onBalanceFetched && lastNotifiedDataRef.current !== data) {
      lastNotifiedDataRef.current = data;
      onBalanceFetched(data);
    }
  }, [data, onBalanceFetched]);

  const income = Math.round(data?.income?.grossIncome ?? 0)
  const totalPaid = Math.round(data?.salary?.totalPaid ?? 0)
  const balance =Math.round( data?.netBalance ?? 0)
  const totalRefund = Math.round(data?.salary?.totalRefund ?? 0)

  return (
    <div className="person-box">
      <div className="person-header">
        <h4>{name}</h4>
        <div className="summary-box">
          <div>درآمد ماه: {income.toLocaleString()} تومان</div>
          <div>پرداختی: {totalPaid.toLocaleString()} تومان</div>
          <div>بازپرداخت: {totalRefund.toLocaleString()} تومان</div>
          <div>مانده: {balance.toLocaleString()} تومان</div>
        </div>
      </div>

      <table className="person-transactions">
        <thead>
          <tr>
            <th>نوع</th>
            <th>مبلغ</th>
            <th>روش</th>
            <th>کد</th>
            <th>توضیح</th>
            <th>تاریخ</th>
           </tr>
        </thead>
        <tbody>
          {Array.isArray(transactions)&& transactions.length>0? transactions.map((t, i) => (
            <tr key={i}>
              <td className={t.type === "payment" ? "green-text" : "red-text"}>
                {t.type === "payment" ? "واریز" : "بازپرداخت"}
              </td>
              <td>{t.fee.toLocaleString()}</td>
              <td>{t.payment}</td>
              <td>{t.coderahgiri}</td>
              <td>{t.note || "-"}</td>
              <td>{moment(t.createdAt).format("jYYYY/jMM/jDD")}</td>
            </tr>
          )):            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                فاقد تراکنش واریز یا باز پرداخت!
              </td>
            </tr>
}
        </tbody>
      </table>
    </div>
  );
};

export default PersonFinanceBox;