import { useCallback, useState } from "react";
import "./salariesfinance.css";
import moment from "moment-jalaali";
import AddSalaryForm from "./AddSalafyForm";
import PersonFinanceBox from "./SalaryDetails";
import TherapistCard from "./therapistCard"; // ✅ فرض بر این است که کارت را به فایل جدا منتقل کرده‌اید

import { useTherapists } from "../../../hooks/therapist";
import { useGetMounthSalary } from "../../../hooks/finance";

const TrueMonth = [
  "فروردین", "اردیبهشت", "خرداد", "تیر",
  "مرداد", "شهریور", "مهر", "آبان",
  "آذر", "دی", "بهمن", "اسفند"
];

const SalariesFinance = () => {
  const [month, setMonth] = useState(moment().jMonth() + 1);
  const [year, setYear] = useState(moment().jYear());
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  
  // ✅ ذخیره اطلاعات مالی هر درمانگر به صورت کش
  const [therapistBalances, setTherapistBalances] = useState({});

  const { data: therapists = [] } = useTherapists();
  const { data: transactions } = useGetMounthSalary(`${year}-${month.toString().padStart(2, "0")}`);

  const YYYYMM = `${year}-${month.toString().padStart(2, "0")}`;

  const therapistTransactions = Array.isArray(transactions)
    ? transactions.filter(t => t.ATModel === "Therapist")
    : [];

  const selectedTransactions = selectedTherapist
    ? therapistTransactions.filter(t => t.payAt?.userId === selectedTherapist._id)
    : [];

  const handleSelectTherapist = (therapist) => {
    setSelectedTherapist(therapist);
  };

  // ✅ وقتی اطلاعات مالی یک درمانگر از PersonFinanceBox رسید، آن را ذخیره کن
 const handleBalanceFetched = useCallback((data) => {
    if (selectedTherapist) {
      setTherapistBalances(prev => ({
        ...prev,
        [selectedTherapist._id]: data
      }));
    }
  }, [selectedTherapist]);

  return (
    <div className="salaries-finance">
      <div className="finance-header">
        <h3>حقوق‌ها و واریزی‌ها</h3>
      </div>

      <AddSalaryForm
        therapists={therapists}
        transactions={transactions}
        month={month}
        year={year}
      />

      <div className="filters">
        <label>ماه:</label>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {TrueMonth[i]}
            </option>
          ))}
        </select>

        <label>سال:</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[1404, 1405, 1406, 1407, 1408, 1409, 1410].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
 {selectedTherapist && (
        <PersonFinanceBox
          name={`${selectedTherapist.firstName} ${selectedTherapist.lastName}`}
          userId={selectedTherapist._id}
          transactions={selectedTransactions}
          YYYYMM={YYYYMM}
          onBalanceFetched={handleBalanceFetched} // ✅ ارسال callback
        />
      )}
      <div className="legend">
        <div className="legend-item green">تسویه شده</div>
        <div className="legend-item red">باید پرداخت شود</div>
        <div className="legend-item yellow">بیشتر پرداخت شده</div>
      </div>

      <div className="therapist-grid">
        {therapists.map(t => (
          <TherapistCard
            key={t._id}
            therapist={t}
            YYYYMM={YYYYMM}
            onSelect={handleSelectTherapist}
            balanceData={therapistBalances[t._id]} // ✅ ارسال اطلاعات ذخیره شده
          />
        ))}
      </div>

     
    </div>
  );
};

export default SalariesFinance;