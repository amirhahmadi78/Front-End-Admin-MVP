const TherapistCard = ({ therapist, YYYYMM, onSelect, balanceData }) => {
  // ✅ از balanceData که از والد می‌آید استفاده کن (نه state داخلی)
  const balance = Math.round(balanceData?.netBalance ?? 0)

  let statusClass = "green";   // تسویه شده
  if (balance > 0) statusClass = "red";     // باید پرداخت شود
  if (balance < 0) statusClass = "yellow";  // بیش از حد پرداخت شده

  const hasData = balanceData !== undefined;

  return (
    <div
      className={`therapist-card ${hasData ? statusClass : "black"}`}
      onClick={() => onSelect(therapist)}
    >
      <h4>{therapist.firstName} {therapist.lastName}</h4>
      <p>
        {!hasData
          ? "برای بررسی کلیک کنید.":
          balance==0?"تسویه می باشد."
          : `${balance.toLocaleString()} تومان`}
      </p>
    </div>
  );
};

export default TherapistCard;