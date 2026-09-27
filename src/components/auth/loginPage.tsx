import {  useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import {useForm} from "react-hook-form"

import type { LoginRequestDto } from "../../types/auth";

import "./login.css"
import { useAuth } from "../../context/AuthContext";
import { loginSchema } from "../../validation/auth/loginSchema";
const LoginPage =  () => {
  const {login}=useAuth()
  // const { user,isAuthenticated,isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });


  useEffect(() => {
    const msg = localStorage.getItem("auth_message");
    if (msg) {
      alert(msg);
      localStorage.removeItem("auth_message");
    }
  }, []);

  const onSubmit = async (data:LoginRequestDto) => {
    try {

  await login(data)

   
      navigate('/dashboard')

    } catch (error) {

      console.log(error);
    }
  };
  return (
    <div className="login-card">
<h1>صفحه ی ورود کادر مدیریت کلینیک</h1>
<br />
<br />

      <h2>ورود</h2>
     

      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="نام کاربری" 
         {...register("phone")}/>
          {errors.phone && (
          <p className="error-message">{errors.phone.message}</p>
        )}
       

        <input
          type="password"
          placeholder="رمز عبور"
          {...register("password")}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
        <button type="button" onClick={() => navigate(-1)}>
          بازگشت
        </button>
      </form>
      <button onClick={()=>window.location.replace("/")}>رفتن به صفحه ی اصلی</button>
    </div>
  );
};

export default LoginPage;
