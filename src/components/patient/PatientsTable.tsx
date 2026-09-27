import { useState } from "react";

import Swal from "sweetalert2";

import List from "./patientDetails/List.tsx";

import WalletTransaction from "./patientDetails/wallet.tsx";
import TransactionList from "./patientDetails/TransactionList.tsx";
import { useDeletePatient } from "../../hooks/patient.ts";


export default function PatientTable({ fetchPatients,patients,setShowModal,
setEditingPatient }) {
const[transactionListModal,setTransactionListModal]=useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // tabs: details, finance, weekly, daily
  const [selectedPatient, setselectedPatient] = useState(null);
const[walletModal,setWalletModal]=useState(false)
  const openModal = (patients) => {
    setselectedPatient(patients);
    setActiveTab("details");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setselectedPatient(null);
  };
  const {mutate:deletePatient}=useDeletePatient()

  const handleDelete=(id,firstName,lastName)=>{
    const name=firstName+" "+lastName
    Swal.fire({
  title: "لطفا توجه فرمایید!",
  text: `آیا از حذف مراجع خود ${name} اطمینان دارید؟`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "بعله  حذف شود!",
  cancelButtonText:"خیر"
}).then((result) => {
  if (result.isConfirmed) {
    deletePatient(id)
   
  }
});

  }


    return(
          <div className="table-container12 overflow-x-auto!">
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>نوع پرداخت</th>
              <th>شماره تماس</th>
              <th>آدرس</th>
              <th> درصد تخفیف</th>
              <th>عملیات</th>
              <th>کیف پول</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(patients)&&patients.length > 0 ? (
              patients.map((onePatient) => (
                <tr key={onePatient._id}>
                  <td>
                    {onePatient.firstName} {onePatient.lastName}
                  </td>
                  <td>{onePatient.paymentType=="bimeh"?"بیمه" : 
                  onePatient.paymentType=="naghd"?"نقدی":""
                  }</td>
                  <td>{onePatient.phone}</td>
                  <td>{onePatient.address}</td>
                  <td>{onePatient.discountPercent}</td>
                  <td className="actions-cell">
                    <button
                      className="view-btn"
                      onClick={() => openModal(onePatient)}
                    >
                      👁️
                    </button>
                    <button className="edit-btn" onClick={()=>{setEditingPatient(onePatient)
                      setShowModal(true)
                    }}>✏️</button>
                    <button onClick={()=>handleDelete(onePatient._id,onePatient.firstName,onePatient.lastName)} className="delete-btn">🗑️</button>
                
                  </td>
                  <td>
                     <button onClick={()=>setWalletModal(onePatient)} className="delete-btn">ثبت تراکنش</button>
                     <button onClick={()=>setTransactionListModal(onePatient)} className="delete-btn">لیست تراکنش ها</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">مراجع یافت نشد</td>
              </tr>
            )}
          </tbody>
        </table>
        <List 
closeModal={closeModal}
activeTab={activeTab}
setActiveTab={setActiveTab} 
selectedPatient={selectedPatient}
isModalOpen={isModalOpen}/>
<WalletTransaction fetchPatients={fetchPatients} setWalletModal={setWalletModal} walletModal={walletModal} />
<TransactionList transactionListModal={transactionListModal} setTransactionListModal={setTransactionListModal} patientId={transactionListModal._id} patientName={transactionListModal.firstName+" "+transactionListModal.lastName}/>
      </div>
    )
}