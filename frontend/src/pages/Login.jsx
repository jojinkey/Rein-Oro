import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App.jsx";

export default function Login() {
 const { user, login } = useContext(AuthContext);
 const navigate = useNavigate();

 const getPostLoginPath = (role) => {
  const savedPath = sessionStorage.getItem("rein_oro_after_login");
  sessionStorage.removeItem("rein_oro_after_login");

  if (role === "admin") return "/admin";
  return savedPath || "/dashboard";
 };

 // Mode: 'login' or 'register'
 const [mode, setMode] = useState("login");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [name, setName] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Redirect if already logged in
 useEffect(() => {
  if (user) {
   navigate(getPostLoginPath(user.role), { replace: true });
  }
 }, [user, navigate]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) return;

  setIsSubmitting(true);

  try {
   const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
   const payload = { email, password };
   if (mode === "register") payload.name = name;
   const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
   });

   const resData = await response.json();
   if (!response.ok) {
    throw new Error(resData.error || "Authentication failed");
   }

   // Success
   const role = String(resData.user?.role || resData.role || "user")
    .trim()
    .toLowerCase();
   const userEmail = resData.user?.email || email;
   alert(
    mode === "login"
     ? `Welcome back, ${userEmail}!`
     : "Account registered successfully! Logging you in...",
   );
    login(userEmail, role, resData.token || "");
   navigate(getPostLoginPath(role), { replace: true });
  } catch (err) {
   alert(err.message);
  } finally {
   setIsSubmitting(false);
  }
 };

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = enter mobile, 2 = enter otp code
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleOpenOtpModal = () => {
   setOtpMobile("");
   setOtpCode("");
   setOtpStep(1);
   setOtpError("");
   setShowOtpModal(true);
  };

  const handleSendOtp = (e) => {
   e.preventDefault();
   if (!/^[+0-9\s-]{10,15}$/.test(otpMobile.trim())) {
    setOtpError("Please enter a valid mobile number.");
    return;
   }
   setOtpError("");
   alert(`A simulated 6-digit OTP code has been sent to ${otpMobile.trim()}.`);
   setOtpStep(2);
  };

  const handleVerifyOtp = (e) => {
   e.preventDefault();
   if (otpCode.trim().length !== 6) {
    setOtpError("Invalid OTP length. Code must be 6 digits.");
    return;
   }
   setOtpError("");
   login("royal.guest@reinoro.com", "user");
   alert("Simulated authentication successful! Welcome to Rein Oro Foods.");
   setShowOtpModal(false);
   navigate(getPostLoginPath("user"), { replace: true });
  };

 return (
  <main className="login-main-section">
   {/* Left Column: Product Showcase */}
   <section className="login-showcase-col left-showcase">
    <img src="images/makhana_classic.png" alt="Makhana Classic" />
    <div style={{ textAlign: "center" }}>
     <h4
      style={{
       fontFamily: "var(--font-heading)",
       fontSize: "1.2rem",
       color: "var(--color-white)",
       fontWeight: 400,
      }}
     >
      Makhana Classic
     </h4>
     <p
      style={{
       fontSize: "0.72rem",
       color: "var(--color-gold)",
       textTransform: "uppercase",
       letterSpacing: "0.05em",
      }}
     >
      Slow Roasted & Salted
     </p>
    </div>
   </section>

   {/* Middle Column: Login Form */}
    <section style={{ display: "flex", justifyContent: "center" }}>
     <div className="login-card" style={{ position: "relative" }}>
      <button
       type="button"
       onClick={() => navigate("/")}
       style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "transparent",
        border: "none",
        color: "var(--color-muted)",
        cursor: "pointer",
        fontSize: "1.5rem",
        lineHeight: 1,
        padding: "4px",
        transition: "color 0.2s",
       }}
       aria-label="Close"
       onMouseEnter={(e) => {
         e.currentTarget.style.color = "var(--color-white)";
       }}
       onMouseLeave={(e) => {
         e.currentTarget.style.color = "var(--color-muted)";
       }}
      >
       &times;
      </button>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <img
       src="images/logo.png"
       alt="Rein Oro Crown"
       style={{ height: "32px", marginBottom: "0.6rem" }}
      />
      <h2
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.8rem",
        fontWeight: 300,
        color: "var(--color-white)",
        letterSpacing: "0.05em",
       }}
      >
       {mode === "login" ? "THE ROYAL CIRCLE" : "JOIN THE HOUSE"}
      </h2>
      <p
       style={{
        fontSize: "0.75rem",
        color: "var(--color-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginTop: "0.2rem",
       }}
      >
       {mode === "login"
        ? "Log in to your member account"
        : "Register your membership"}
      </p>
     </div>

     <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}
     >
      <div className="contact-form-group">
       <label htmlFor="login-email" className="contact-form-label">
        Email Address
       </label>
       <input
        type="email"
        id="login-email"
        className="contact-form-input"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
       />
      </div>

      {mode === "register" && (
       <div className="contact-form-group">
        <label htmlFor="register-name" className="contact-form-label">
         Full Name
        </label>
        <input
         type="text"
         id="register-name"
         className="contact-form-input"
         placeholder="Enter your full name"
         value={name}
         onChange={(e) => setName(e.target.value)}
         disabled={isSubmitting}
        />
       </div>
      )}

      <div className="contact-form-group" style={{ position: "relative" }}>
       <label htmlFor="login-password" className="contact-form-label">
        Password
       </label>
       <div style={{ position: "relative", width: "100%" }}>
        <input
         type={showPassword ? "text" : "password"}
         id="login-password"
         className="contact-form-input"
         placeholder="Enter your password"
         required
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         disabled={isSubmitting}
         style={{ paddingRight: "45px" }}
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         style={{
          position: "absolute",
          top: "50%",
          right: "15px",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "var(--color-muted)",
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
         }}
        >
         {showPassword ? (
          <svg
           xmlns="http://www.w3.org/2000/svg"
           width="16"
           height="16"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeWidth="2"
           strokeLinecap="round"
           strokeLinejoin="round"
          >
           <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
           <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
           <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
           <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
         ) : (
          <svg
           xmlns="http://www.w3.org/2000/svg"
           width="16"
           height="16"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeWidth="2"
           strokeLinecap="round"
           strokeLinejoin="round"
          >
           <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
           <circle cx="12" cy="12" r="3" />
          </svg>
         )}
        </button>
       </div>
      </div>

      <button
       type="submit"
       className="btn btn-primary"
       disabled={isSubmitting}
       style={{ width: "100%", height: "44px", marginTop: "0.5rem" }}
      >
       {isSubmitting ? (
        <>
         <svg
          className="spinner-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "8px" }}
         >
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
         </svg>
         Authenticating...
        </>
       ) : mode === "login" ? (
        "SIGN IN"
       ) : (
        "CREATE ACCOUNT"
       )}
      </button>

      {mode === "login" && (
       <button
        type="button"
        className="btn btn-outline"
        onClick={handleOpenOtpModal}
        style={{ width: "100%", height: "44px", padding: 0 }}
       >
        SIGN IN WITH OTP
       </button>
      )}
     </form>

     {/* Toggle link */}
     <div
      style={{
       marginTop: "1.8rem",
       textAlign: "center",
       fontSize: "0.8rem",
       borderTop: "1px solid rgba(255,255,255,0.05)",
       paddingTop: "1.2rem",
      }}
     >
      {mode === "login" ? (
       <p style={{ color: "var(--color-muted)" }}>
        New to the House? &nbsp;
        <button
         onClick={() => {
          setMode("register");
          setName("");
         }}
         style={{
          background: "transparent",
          border: "none",
          color: "var(--color-gold)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.8rem",
         }}
        >
         Create your membership
        </button>
       </p>
      ) : (
       <p style={{ color: "var(--color-muted)" }}>
        Already a member? &nbsp;
        <button
         onClick={() => {
          setMode("login");
          setName("");
         }}
         style={{
          background: "transparent",
          border: "none",
          color: "var(--color-gold)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.8rem",
         }}
        >
         Sign in to account
        </button>
       </p>
      )}
     </div>
    </div>
   </section>

   {/* Right Column: Product Showcase */}
   <section className="login-showcase-col right-showcase">
    <img src="images/almonds_california.png" alt="Almonds California" />
    <div style={{ textAlign: "center" }}>
     <h4
      style={{
       fontFamily: "var(--font-heading)",
       fontSize: "1.2rem",
       color: "var(--color-white)",
       fontWeight: 400,
      }}
     >
      California Premium
     </h4>
     <p
      style={{
       fontSize: "0.72rem",
       color: "var(--color-gold)",
       textTransform: "uppercase",
       letterSpacing: "0.05em",
      }}
     >
      Double Sorted & Dried
     </p>
    </div>
   </section>

   {showOtpModal && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <div
      style={{
       width: "100%",
       maxWidth: "420px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.5rem",
       boxShadow: "0 10px 50px rgba(0,0,0,0.8)",
      }}
     >
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.5rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "1rem",
        textAlign: "center",
       }}
      >
       OTP Authentication
      </h3>
      <p
       style={{
        fontSize: "0.82rem",
        color: "var(--color-muted)",
        textAlign: "center",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       {otpStep === 1
        ? "Access your royal account using a temporary passcode sent to your device."
        : `Enter the simulated 6-digit OTP code sent to your number: ${otpMobile}`}
      </p>

      {otpError && (
       <div
        style={{
         backgroundColor: "rgba(255, 80, 80, 0.1)",
         border: "1px solid rgba(255, 80, 80, 0.2)",
         color: "#ff5050",
         fontSize: "0.78rem",
         padding: "0.6rem 1rem",
         borderRadius: "4px",
         marginBottom: "1.2rem",
         textAlign: "center",
        }}
       >
        {otpError}
       </div>
      )}

      {otpStep === 1 ? (
       <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div className="contact-form-group">
         <label htmlFor="otpMobileInput" className="contact-form-label">
          Mobile Number
         </label>
         <input
          type="tel"
          id="otpMobileInput"
          className="contact-form-input"
          placeholder="e.g. +91 99999 99999"
          required
          value={otpMobile}
          onChange={(e) => setOtpMobile(e.target.value)}
          autoFocus
         />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
         <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1, height: "42px", fontWeight: "bold" }}
         >
          SEND OTP CODE
         </button>
         <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowOtpModal(false)}
          style={{ flex: 1, height: "42px" }}
         >
          CANCEL
         </button>
        </div>
       </form>
      ) : (
       <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div className="contact-form-group">
         <label htmlFor="otpCodeInput" className="contact-form-label">
          Enter 6-Digit Code
         </label>
         <input
          type="text"
          id="otpCodeInput"
          className="contact-form-input"
          placeholder="e.g. 123456"
          required
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          autoFocus
         />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
         <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1, height: "42px", fontWeight: "bold" }}
         >
          VERIFY CODE
         </button>
         <button
          type="button"
          className="btn btn-outline"
          onClick={() => setOtpStep(1)}
          style={{ flex: 1, height: "42px" }}
         >
          BACK
         </button>
        </div>
       </form>
      )}
     </div>
    </div>
   )}
  </main>
 );
}
