import { useState } from "react";
import List from "./therapistDetails/List";
import Swal from "sweetalert2";

import { useDeleteTherapist } from "../../hooks/therapist";
import { AlertSwal } from "../../utils/errorSwal";

export default function TherapistTable({
  therapists,
  setShowModal,
  setEditingTherapist,
}) {
  if (!therapists) {
    therapists = [];
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const openModal = (therapist) => {
    setSelectedTherapist(therapist);
    setActiveTab("details");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
  };
  const { mutate, isPending } = useDeleteTherapist();
  const handleDelete = async (id, firstName, lastName) => {
    const name = firstName + " " + lastName;
    AlertSwal.doYouWant(`آیا از حذف درمانگر خود ${name} اطمینان دارید؟`).then(
      (result) => {
        if (result.isConfirmed) {
          mutate(id);
        }
      },
    );
  };

  return (
    <div className="table-container overflow-x-auto!">
      <table>
        <thead>
          <tr>
            <th>نام</th>
            <th>تخصص</th>
            <th>شماره تماس</th>
            <th>درصد پیش‌فرض</th>
            <th>درصد معرفی</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(therapists)&&therapists.length > 0 ? (
            therapists.map((oneTherapist) => (
              <tr key={oneTherapist._id}>
                <td>
                  {oneTherapist.firstName} {oneTherapist.lastName}
                </td>
                <td>
                  {oneTherapist.role == "OT"
                    ? "کاردرمانگر"
                    : oneTherapist.role == "SLP"
                      ? "گفتاردرمانگر"
                      : oneTherapist.role == "PSY"
                        ? "روانشناس"
                        : oneTherapist.role == "PT"
                          ? "فیزیوتراپیست"
                          : oneTherapist.role == "therapist"
                            ? "درمانگر"
                            : "نامشخص"}
                </td>
                <td>{oneTherapist.phone}</td>
                <td>{oneTherapist.percentDefault}</td>
                <td>{oneTherapist.percentIntroduced}</td>
                <td className="actions-cell">
                  <button
                    className="view-btn"
                    onClick={() => openModal(oneTherapist)}
                  >
                    👁️
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingTherapist(oneTherapist);
                      setShowModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(
                        oneTherapist._id,
                        oneTherapist.firstName,
                        oneTherapist.lastName,
                      )
                    }
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">درمانگری یافت نشد</td>
            </tr>
          )}
        </tbody>
      </table>
      <List
        closeModal={closeModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTherapist={selectedTherapist}
        isModalOpen={isModalOpen}
      />
    </div>
  );
}
