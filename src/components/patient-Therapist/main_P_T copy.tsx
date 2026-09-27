import {  useMemo, useState } from "react";
import "./main.css";

import { useFindPatient } from "../../hooks/patient";
import { useTherapists } from "../../hooks/therapist";
import {
  useAddRelate,
  useCheckRelate,
  useRemoveRelate,
} from "../../hooks/patient-therapist";
import type { Get_Relate } from "../../services/patient-therapist";
import Pagination from "../util/pagination";

const MainPatient_Therapist = () => {
   const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("patients");
  const [searchTerm] = useState("");
  const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
  const [querySearch, setQuerySearch] = useState();
  const[payload,setPayload] =useState<Get_Relate>({
    therapistId:1,
    patientId:1
  })
  const [addSearchTerm, setAddSearchTerm] = useState("");

  const { data: patients } = useFindPatient({});
  const { data: therapists } = useTherapists();
  const {mutate:AddRelate} = useAddRelate();
  const {data:selectedItem} = useCheckRelate(payload);
  const {mutate:RemoveRelate} = useRemoveRelate();


const addFilteredList = useMemo(() => {
  const list = activeTab === "patients" ? therapists : patients;
if(Array.isArray(list)){
return list.filter((p) =>
    (p.firstName + " " + p.lastName)
      .toLowerCase()
      .includes(addSearchTerm.toLowerCase())
  );
}else return []
  
}, [addSearchTerm, activeTab, patients, therapists]);

const handleSearch=()=>{
  setQuerySearch({
    firstName:firstName,
    lastName:lastName
  })
}


  const handleAddRelation = (item) => {
    if (!selectedItem) return;

    const patientId = activeTab === "patients" ? selectedItem?._id : item._id;
    const therapistId = activeTab === "patients" ? item._id : selectedItem?._id;

    AddRelate({patientId, therapistId})

    }
      

  const handleRemoveRelation =  (item) => {

      const patientId = activeTab === "patients" ? selectedItem._id : item._id;
      const therapistId =
        activeTab === "patients" ? item._id : selectedItem._id;

      RemoveRelate({patientId, therapistId});


  };

  const filteredList = useMemo(() => {
  const list = activeTab === "patients" ? patients : therapists;
if(list && Array.isArray(list)){
return  list.filter((item) =>
    (item.firstName + " " + item.lastName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
}else{
  return []
}
  
}, [activeTab, patients, therapists, searchTerm]);


  const handleCheckRelate = async (item) => {
    let therapistId;
    let patientId;
    if (item.modeluser == "therapist") {
      therapistId = item._id;
      patientId = 1;
    } else if (item.modeluser == "patient") {
      therapistId = 1;
      patientId = item._id;
    }


    setPayload({
      therapistId,patientId
    })

  };


  return (
    <div className="assign-container">
      <h2>مدیریت ارتباط مراجعین و درمانگران</h2>

      <div className="tabs">
        <button
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => {
            setActiveTab("patients");
            setPayload({
    therapistId:1,
    patientId:1
  });
            setQuerySearch({});
          }}
        >
          بر اساس مراجع
        </button>
        <button
          className={activeTab === "therapists" ? "active" : ""}
          onClick={() => {
            setActiveTab("therapists");
           setPayload({
    therapistId:1,
    patientId:1
  });
      setQuerySearch({});
          }}
        >
          بر اساس درمانگر
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder={
            activeTab === "patients" ? "نام  مراجع..." : "نام درمانگر..."
          }
          value={searchTerm}
          onChange={(e) => setFirstName(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder={
            activeTab === "patients" ? "نام خانوادگی مراجع..." : "نام خانوادگی درمانگر..."
          }
          value={searchTerm}
          onChange={(e) => setLastName(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list-section">
        {filteredList.map((item) => (
          <div
            key={item._id}
            className={`list-item ${
              selectedItem?._id === item._id ? "active" : ""
            }`}
            onClick={() => handleCheckRelate(item)}
          >
            {item.firstName + " " + item.lastName}
          </div>
        ))}
      </div>
 <Pagination
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages || 1}
      />
      {selectedItem && (
        <div className="relation-section">
          <h3>
            {activeTab === "patients"
              ? `درمانگران ${selectedItem.firstName + " " + selectedItem.lastName}`
              : `مراجعین ${selectedItem.firstName + " " + selectedItem.lastName}`}
          </h3>
          <ul className="relation-list">
            {(activeTab === "patients"
              ? selectedItem.therapists
              : selectedItem.patients
            ).map((r, index) => (
              <li key={index} className="relation-item">
                <span>{r.firstName + " " + r.lastName}</span>
                <button
                  onClick={() => handleRemoveRelation(r)}
                  className="remove-btn"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>

          <div className="add-relation">
            <input
              type="text"
              placeholder={
                activeTab === "patients"
                  ? "نام درمانگر جدید..."
                  : "نام مراجع جدید..."
              }
              className="add-input"
              value={addSearchTerm}
              onChange={(e) => setAddSearchTerm(e.target.value)}
            />
            {addSearchTerm && (
              <ul className="add-dropdown">
                {addFilteredList.map((p) => (
                  <li
                    key={p._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAddRelation(p);
                    }}
                    className="dropdown-item"
                  >
                    {p.firstName} {p.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="add-btn">افزودن</button>
        </div>
      )}
    </div>
  );
};

export default MainPatient_Therapist;
