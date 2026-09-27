import PatientForm from "./PatientsForm.tsx";


export default function PatientModal({onSubmit,onClose,editingPatient}){



    return(
           
        <div className="modal-overlay">
          <div className="modal">
            <button id="closeform"  onClick={()=>onClose()}>×</button>
            <h3>افزودن مراجع جدید</h3>
           <PatientForm editingPatient={editingPatient} onSubmit={onSubmit} onCancel={onClose}/>
          </div>
        </div>
    
    )
} 