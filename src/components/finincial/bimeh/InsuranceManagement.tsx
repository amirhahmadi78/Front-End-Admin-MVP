// import  { useState } from 'react';
// import './InsuranceManagement.css';
// import InsuranceContracts from './InsuranceContracts';
// import InsurancePayment from './InsurancePayment';
// import InsuranceReports from './InsuranceReports';
// import InsuranceSessions from './InsuranceSessions';

const InsuranceManagement = () => {
  return(
    <div className='items-center! '>
      <h1 className='font-bold text-red-500 text-2xl text-center pt-30!'>این بخش در دست توسعه می باشد.
        لطفا پس از آپدیت مربوطه مراجعه فرمایید!
      </h1>
    </div>
  )
  // const [activeSection, setActiveSection] = useState('sessions');

  // const renderSection = () => {
  //   switch (activeSection) {
  //     case 'sessions':
  //       return <InsuranceSessions />;
  //     case 'contracts':
  //       return <InsuranceContracts />;
  //     case 'payment':
  //       return <InsurancePayment />;
  //     case 'reports':
  //       return <InsuranceReports />;
  //     default:
  //       return <InsuranceSessions />;
  //   }
  // };

  // return (
  //   <div className="insurance-management">
  //     <div className="insurance-header">
  //       <h1>مدیریت امور بیمه</h1>
  //       <p>مدیریت قراردادهای بیمه، ثبت واریزی‌ها و گزارشات بیمه‌ای</p>
  //     </div>

  //     <div  className="insurance-tabs">
  //       <button
  //         className={`tab-btn ${activeSection === 'sessions' ? 'active' : ''}`}
  //         onClick={() => setActiveSection('sessions')}
  //       >
  //         <i className="fas fa-calendar-alt"></i>
  //         <span>جلسات بیمه‌ای</span>
  //       </button>
  //       <button
  //         className={`tab-btn ${activeSection === 'contracts' ? 'active' : ''}`}
  //         onClick={() => setActiveSection('contracts')}
  //       >
  //         <i className="fas fa-file-contract"></i>
  //         <span>بیمه‌های طرف قرارداد</span>
  //       </button>
  //       <button
  //         className={`tab-btn ${activeSection === 'payment' ? 'active' : ''}`}
  //         onClick={() => setActiveSection('payment')}
  //       >
  //         <i className="fas fa-money-check-alt"></i>
  //         <span>ثبت واریزی از بیمه</span>
  //       </button>
  //       <button
  //         className={`tab-btn ${activeSection === 'reports' ? 'active' : ''}`}
  //         onClick={() => setActiveSection('reports')}
  //       >
  //         <i className="fas fa-chart-bar"></i>
  //         <span>بررسی ریز موارد بیمه</span>
  //       </button>
  //     </div>

  //     <div className="insurance-content">
  //       {renderSection()}
  //     </div>
  //   </div>
  // );
};

export default InsuranceManagement;