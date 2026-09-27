import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/auth/loginPage";
import MainPage from "./components/main";
import RegisterPage from "./components/auth/registerPage";
import LayoutDashboard from "./components/layout/Layout";
import MainAdmin from "./components/dashboard/mainPanel";
import MainTherapists from "./components/therapists/mainTherapist";
import MainPatients from "./components/patient/mainPatients";
import { LoadingOverlay } from "./components/loadingOverlay/LoadingOverlay";
import MainWeeklydef from "./components/weeklyDef/main";
import MainPatient_Therapist from "./components/patient-Therapist/main_P_T";
import MainFinance from "./components/finincial/MainFinance";
import LeaveRequests from "./components/leaves&messages/LeaveRequests";
import PatientManagement from "./components/patientManagement/PatientManagement";
import AdvancedSettings from "./components/advance/main";
import Admin_management from "./components/Admin-ManageMent/main";
import "./styles/fonts.css";
import { MainPatientProfile } from "./components/patientProfile/mainPatientProfile";
import OnePatientProfile from "./components/patientProfile/OnePatientProfile/OnePatientProfile";
import { MainOnePatientAssessments } from "./components/patientProfile/patientAssesments/mainPatientAssesments";
import { AssessmentTemplatesPanel } from "./components/systematicAssessments/main";
import { AssessmentTemplateCreateForm } from "./components/systematicAssessments/createSystematicAssessment";
import ExerciseManagerPanel from "./components/exercises/exerciseManagerPanel";
import ExerciseSheetListPage from "./components/exercise-sheet/ExerciseSheetListPage";
import { PatientExerciseSheetsPage } from "./components/patientProfile/patientExercises/PatientExerciseSheetsPage";
import WorkspaceNavigation from "./components/exercise&assessments/WorkspaceNavigation";
// import ExerciseForm from "./components/exercises/exerciseForm";


function App() {
  const { isAuthenticated, isLoading,user } = useAuth();
const navigate=useNavigate()
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          direction: "rtl",
        }}
      >
        <div style={{ color: "#4b5563", fontSize: "0.875rem" }}>
          در حال بررسی وضعیت ورود...
        </div>
      </div>
    );
  }


  return (
    <>
      <LoadingOverlay />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route path="/" element={<LayoutDashboard />}>
          <Route path="dashboard" element={<MainAdmin />} />
          <Route path="therapists" element={<MainTherapists />} />
          <Route path="patients" element={<MainPatients />} />
         
          <Route path="patient-therapist" element={<MainPatient_Therapist />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="patient-management" element={<PatientManagement />} />
          <Route path="finance" element={<MainFinance />} />
            <Route path="exercise-assessment" element={<WorkspaceNavigation />} />
           <Route path="exercise-sheets" element={<ExerciseSheetListPage currentTherapistId={user?._id} />} />
           <Route path="patientprofile">
            {/* مسیر فرزند: پارامتر Id اجباری است */}
            <Route index element={<MainPatientProfile/>}/>
           
            <Route
              path=":Id"
              element={<OnePatientProfile />}
            />
               <Route
              path=":Id/assessments"
              element={<MainOnePatientAssessments />}
            />
                <Route
              path=":Id/exercises"
              element={<PatientExerciseSheetsPage  />}
            />
                  </Route>
              <Route path="systematicassessments">
            {/* مسیر فرزند: پارامتر Id اجباری است */}
            <Route index element={<AssessmentTemplatesPanel/>}/>
            <Route
              path="edit/:id/"
              element={<AssessmentTemplateCreateForm />}
            />
            <Route
              path="new/"
              element={<AssessmentTemplateCreateForm />}
            />
          </Route>
                <Route path="exercises">
            {/* مسیر فرزند: پارامتر Id اجباری است */}
            <Route index element={<ExerciseManagerPanel currentTherapistId={user?._id} onCreateExercise={()=>navigate('/exercises/new') } onEditExercise={ (exercise:IExercise)=>navigate("/exercises/edit/"+exercise._id) }/>}/>
            {/* <Route
              path="edit/:id/"
              element={<ExerciseForm onSuccess={()=>navigate("/exercises") } onCancel={()=>navigate("/exercises")} />}
            />
            <Route
              path="new/"
              element={<ExerciseForm onSuccess={()=>navigate("/exercises") } onCancel={()=>navigate("/exercises")}  />}
            /> */}
          </Route>
          {user?.role === "Admin" && (
            <Route path="advance" element={<AdvancedSettings />} />
          )}
          <Route path="weeklydef" element={<MainWeeklydef />} />
          {user?.role === "Admin" && (
            <Route path="adminmanagement" element={<Admin_management />} />
          )}

          </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
