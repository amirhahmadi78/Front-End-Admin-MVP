import TherapistForm from "./TherapistForm";

export default function TherapistModal({onSubmit,onClose,editingTherapist}){


    return(
           
        <div className="modal-overlay">
          <div className="modal">
            <button id="closeform"  onClick={()=>onClose()}>×</button>
            <h3>افزودن درمانگر جدید</h3>
           <TherapistForm editingTherapist={editingTherapist} onSubmit={onSubmit} onCancel={onClose}/>
          </div>
        </div>
    
    )
} 