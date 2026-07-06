import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";
import {
 getFirebaseClient,
 isFirebaseClientConfigured,
} from "../config/firebase.js";

const useDirectFirebaseClientAuth =
 import.meta.env.VITE_FIREBASE_CLIENT_AUTH === "true";

function normalizeMobileForFirebase(value) {
 const raw = String(value || "").trim();
 const digits = raw.replace(/\D/g, "");
 if (raw.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
  return `+${digits}`;
 }
 if (digits.length === 10) return `+91${digits}`;
 if (digits.length === 11 && digits.startsWith("0")) {
  return `+91${digits.slice(1)}`;
 }
 if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
 if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
 return raw;
}

function getPhoneLookupKey(value) {
 return normalizeMobileForFirebase(value).replace(/\D/g, "");
}

async function readJsonResponse(response) {
 const text = await response.text();
 if (!text) return {};
 try {
  return JSON.parse(text);
 } catch {
  throw new Error(
   `Server returned an invalid response (${response.status || "unknown"}). Please make sure the backend is running.`,
  );
 }
}

function getFirebaseErrorMessage(error) {
 const code = String(error?.code || "");
 const rawMessage = String(error?.message || "");
 if (/recaptcha client element has been removed/i.test(rawMessage)) {
  return "OTP verification was refreshed. Please tap Send OTP again.";
 }
 if (/missing or insufficient permissions/i.test(rawMessage)) {
  return "Firestore rules are not deployed yet. Please sign in with email, or deploy the included Firestore rules for mobile login.";
 }
 const messageMap = {
  "permission-denied": "Firestore rules are not deployed yet. Please sign in with email, or deploy the included Firestore rules for mobile login.",
  "auth/captcha-check-failed": "reCAPTCHA verification failed. Please tap Send OTP again.",
  "auth/invalid-app-credential": "Firebase phone login is not fully configured for this domain.",
  "auth/missing-app-credential": "reCAPTCHA verification could not start. Please tap Send OTP again.",
  "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
  "auth/email-already-in-use": "This email is already registered. Please sign in.",
  "auth/invalid-credential": "Invalid email/mobile number or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Password is required.",
  "auth/network-request-failed": "Firebase network request failed. Please check internet/backend setup.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/user-not-found": "Invalid email/mobile number or password.",
  "auth/wrong-password": "Invalid email/mobile number or password.",
 };
 return messageMap[code] || error?.message || "Firebase authentication failed.";
}

export default function Login() {
 const { user, login } = useContext(AuthContext);
 const navigate = useNavigate();
  useEffect(() => {
    document.body.classList.add("login-page-body");
    return () => {
      document.body.classList.remove("login-page-body");
    };
  }, []);


 const getPostLoginPath = (role) => {
  const savedPath = sessionStorage.getItem("rein_oro_after_login");
  sessionStorage.removeItem("rein_oro_after_login");

  if (role === "admin") return "/admin";
  return savedPath || "/dashboard";
 };

 const [mode, setMode] = useState("login");
 const [identifier, setIdentifier] = useState("");
 const [email, setEmail] = useState("");
 const [mobile, setMobile] = useState("");
 const [password, setPassword] = useState("");
 const [name, setName] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [showOtpModal, setShowOtpModal] = useState(false);
 const [otpStep, setOtpStep] = useState(1);
 const [otpMobile, setOtpMobile] = useState("");
 const [otpCode, setOtpCode] = useState("");
 const [otpError, setOtpError] = useState("");
 const [otpNotice, setOtpNotice] = useState("");
 const [otpDebugCode, setOtpDebugCode] = useState("");
 const [otpSubmitting, setOtpSubmitting] = useState(false);
 const [firebaseOtpConfirmation, setFirebaseOtpConfirmation] = useState(null);
 const [recaptchaRenderKey, setRecaptchaRenderKey] = useState(0);
 const recaptchaVerifierRef = useRef(null);
 const firebaseAuthRef = useRef(null);

 const clearRecaptchaVerifier = () => {
  const verifier = recaptchaVerifierRef.current;
  recaptchaVerifierRef.current = null;
  if (verifier?.clear) {
   try {
    verifier.clear();
   } catch {
    // Firebase can throw if the verifier was already detached by a modal close.
   }
  }
 };

 const resetRecaptchaVerifier = () => {
  clearRecaptchaVerifier();
  setRecaptchaRenderKey((key) => key + 1);
 };

 useEffect(() => {
  if (user) {
   navigate(getPostLoginPath(user.role), { replace: true });
  }
 }, [user, navigate]);

 useEffect(() => {
  return () => {
   clearRecaptchaVerifier();
  };
 }, []);

 const resetForm = (nextMode) => {
  setMode(nextMode);
  setIdentifier("");
  setEmail("");
  setMobile("");
  setPassword("");
  setName("");
  setShowPassword(false);
 };

 const completeLogin = (resData, fallbackIdentity = "") => {
  const profile = resData.user || {};
  const role = String(profile.role || resData.role || "user")
   .trim()
   .toLowerCase();
  login(
   {
    uid: profile.uid || "",
    name: profile.name || "",
    email: profile.email || fallbackIdentity,
    phone: profile.phone || "",
    token: resData.token || "",
   },
   role,
   resData.token || "",
  );
  navigate(getPostLoginPath(role), { replace: true });
 };

 const getFirebaseProfile = async (db, userRecord, fallback = {}) => {
  const { doc, getDoc, setDoc, serverTimestamp } = await import(
   "firebase/firestore"
  );
  const userRef = doc(db, "users", userRecord.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
   return { uid: userRecord.uid, ...snapshot.data() };
  }

  const email = userRecord.email || fallback.email || "";
  const profile = {
   uid: userRecord.uid,
   name:
    userRecord.displayName ||
    fallback.name ||
    (email ? email.split("@")[0] : "Rein Oro Member"),
   email,
   phone: userRecord.phoneNumber || fallback.phone || "",
   photoURL: userRecord.photoURL || null,
   addresses: [],
   wishlist: [],
   totalOrders: 0,
   totalSpent: 0,
   role: "user",
   createdAt: serverTimestamp(),
   lastLoginAt: serverTimestamp(),
  };
  await setDoc(userRef, profile, { merge: true });
  return profile;
 };

 const getEmailForFirebaseLogin = async (db, value) => {
  if (value.includes("@")) return value.toLowerCase();
  const { doc, getDoc } = await import("firebase/firestore");
  const phoneKey = getPhoneLookupKey(value);
  if (!phoneKey) {
   throw new Error("Enter a valid email or mobile number.");
  }
  let phoneDoc;
  try {
   phoneDoc = await getDoc(doc(db, "phone_login", phoneKey));
  } catch (err) {
   if (
    err?.code === "permission-denied" ||
    /missing or insufficient permissions/i.test(String(err?.message || ""))
   ) {
    const permissionError = new Error(
     "Firestore rules are not deployed yet. Please sign in with email, or deploy the included Firestore rules for mobile login.",
    );
    permissionError.code = "permission-denied";
    throw permissionError;
   }
   throw err;
  }
  if (!phoneDoc.exists()) {
   throw new Error("Invalid mobile number or password.");
  }
  const emailFromPhone = String(phoneDoc.data()?.email || "").trim();
  if (!emailFromPhone) {
   throw new Error("This mobile number is not linked with an email account.");
  }
  return emailFromPhone.toLowerCase();
 };

 const handleFirebaseSubmit = async ({
 cleanIdentifier,
 cleanEmail,
 cleanMobile,
 }) => {
  if (!useDirectFirebaseClientAuth || !isFirebaseClientConfigured) return false;

  const firebaseClient = await getFirebaseClient();
  if (!firebaseClient.auth || !firebaseClient.db) return false;

  const [
   {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
   },
   { doc, setDoc, serverTimestamp },
  ] = await Promise.all([import("firebase/auth"), import("firebase/firestore")]);

  if (mode === "forgot") {
   const resetEmail = await getEmailForFirebaseLogin(
    firebaseClient.db,
    cleanIdentifier,
   );
   await sendPasswordResetEmail(firebaseClient.auth, resetEmail);
   alert("Password reset email sent if the account exists.");
   resetForm("login");
   return true;
  }

  if (mode === "register") {
   const normalizedPhone = cleanMobile
    ? normalizeMobileForFirebase(cleanMobile)
    : "";
   const credential = await createUserWithEmailAndPassword(
    firebaseClient.auth,
    cleanEmail.toLowerCase(),
    password,
   );
   
   // Send email verification
   const { sendEmailVerification, signOut } = await import("firebase/auth");
   await sendEmailVerification(credential.user);
   
   await updateProfile(credential.user, {
    displayName: name.trim() || cleanEmail.split("@")[0],
   });
   const profile = {
    uid: credential.user.uid,
    name: name.trim() || cleanEmail.split("@")[0],
    email: cleanEmail.toLowerCase(),
    phone: normalizedPhone,
    photoURL: null,
    addresses: [],
    wishlist: [],
    totalOrders: 0,
    totalSpent: 0,
    role: "user",
    createdAt: serverTimestamp(),
    member_since: new Date().toISOString(),
    lastLoginAt: serverTimestamp(),
   };
   await setDoc(doc(firebaseClient.db, "users", credential.user.uid), profile, {
    merge: true,
   });
   if (normalizedPhone) {
    await setDoc(
     doc(firebaseClient.db, "phone_login", getPhoneLookupKey(normalizedPhone)),
     {
      uid: credential.user.uid,
      email: profile.email,
      phone: normalizedPhone,
      updatedAt: serverTimestamp(),
     },
     { merge: true },
    );
   }
   
   // Sign out immediately so they cannot access the dashboard before verifying
   await signOut(firebaseClient.auth);
   
   alert("Account registered successfully. A verification link has been sent to your email. Please verify it before logging in.");
   resetForm("login");
   return true;
  }

  const loginEmail = await getEmailForFirebaseLogin(
   firebaseClient.db,
   cleanIdentifier,
  );
  const credential = await signInWithEmailAndPassword(
   firebaseClient.auth,
   loginEmail,
   password,
  );
  
  if (!credential.user.emailVerified) {
   const { sendEmailVerification, signOut } = await import("firebase/auth");
   await sendEmailVerification(credential.user).catch((err) => console.error("Resend error:", err));
   await signOut(firebaseClient.auth);
   throw new Error("Your email address is not verified. A new verification link has been sent to your email.");
  }
  
  const profile = await getFirebaseProfile(firebaseClient.db, credential.user, {
   email: loginEmail,
  });
  const token = await credential.user.getIdToken();
  await setDoc(
   doc(firebaseClient.db, "users", credential.user.uid),
   { lastLoginAt: serverTimestamp() },
   { merge: true },
  );
  alert("Welcome back to Rein Oro.");
  completeLogin({ success: true, token, user: profile }, cleanIdentifier);
  return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanIdentifier = identifier.trim();
  const cleanEmail = email.trim();
  const cleanMobile = mobile.trim();

  if (mode === "login" && (!cleanIdentifier || !password)) return;
  if (mode === "register" && (!cleanEmail || !password)) return;
  if (mode === "forgot" && !cleanIdentifier) return;

  setIsSubmitting(true);

  try {
   const handledByFirebase = await handleFirebaseSubmit({
    cleanIdentifier,
    cleanEmail,
    cleanMobile,
   });
   if (handledByFirebase) return;

   const endpoint =
    mode === "login"
     ? "/api/auth/login"
     : mode === "register"
       ? "/api/auth/register"
       : "/api/auth/forgot-password";
   const payload =
    mode === "login"
     ? { identifier: cleanIdentifier, password }
     : mode === "register"
       ? { name, email: cleanEmail, phone: cleanMobile, password }
       : { identifier: cleanIdentifier };

   const response = await fetch(apiUrl(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
   });

   const resData = await readJsonResponse(response);
   if (!response.ok) {
    const details = Array.isArray(resData.details)
     ? `: ${resData.details.join(", ")}`
     : "";
    throw new Error(`${resData.error || "Authentication failed"}${details}`);
   }

   if (mode === "forgot") {
    alert(resData.message || "Password reset email sent if the account exists.");
    resetForm("login");
    return;
   }

   alert(
    mode === "login"
     ? "Welcome back to Rein Oro."
     : "Account registered successfully.",
   );
   completeLogin(resData, mode === "register" ? cleanEmail : cleanIdentifier);
  } catch (err) {
   alert(getFirebaseErrorMessage(err));
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleOpenOtpModal = () => {
  resetRecaptchaVerifier();
  setOtpMobile("");
  setOtpCode("");
  setOtpStep(1);
  setOtpError("");
  setOtpNotice("");
  setOtpDebugCode("");
  setFirebaseOtpConfirmation(null);
  setShowOtpModal(true);
 };

 const closeOtpModal = () => {
  resetRecaptchaVerifier();
  setFirebaseOtpConfirmation(null);
  setShowOtpModal(false);
 };

 const getRecaptchaVerifier = async (auth) => {
  if (!auth || !isFirebaseClientConfigured) return null;
  clearRecaptchaVerifier();

  if (!document.getElementById("rein-oro-recaptcha")) {
   throw new Error("OTP verifier is still loading. Please close OTP and try again.");
  }

  const { RecaptchaVerifier } = await import("firebase/auth");
  recaptchaVerifierRef.current = new RecaptchaVerifier(
   auth,
   "rein-oro-recaptcha",
   {
    size: "invisible",
    callback: () => {
     setOtpError("");
    },
    "expired-callback": () => {
     resetRecaptchaVerifier();
    },
   },
  );
  return recaptchaVerifierRef.current;
 };

 const handleSendOtp = async (e) => {
  e.preventDefault();
  const cleanMobile = normalizeMobileForFirebase(otpMobile);
  if (!/^[+0-9\s-]{10,15}$/.test(cleanMobile)) {
   setOtpError("Please enter a valid mobile number.");
   return;
  }

  setOtpSubmitting(true);
  setOtpError("");
  setOtpNotice("");
  setOtpDebugCode("");

  try {
   if (useDirectFirebaseClientAuth && isFirebaseClientConfigured) {
    const [{ signInWithPhoneNumber }, firebaseClient] = await Promise.all([
     import("firebase/auth"),
     getFirebaseClient(),
    ]);
    const auth = firebaseClient.auth;
    firebaseAuthRef.current = auth;
    const appVerifier = await getRecaptchaVerifier(auth);
    const confirmation = await signInWithPhoneNumber(
     auth,
     cleanMobile,
     appVerifier,
    );
    setFirebaseOtpConfirmation(confirmation);
    setOtpMobile(cleanMobile);
    setOtpNotice("OTP sent successfully.");
    setOtpStep(2);
    return;
   }

   const response = await fetch(apiUrl("/api/auth/otp/request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: cleanMobile }),
   });
   const data = await readJsonResponse(response);
   if (!response.ok) {
    throw new Error(data.error || "Unable to send OTP");
   }

   setOtpNotice(data.message || "OTP sent successfully.");
   if (data.devOtp) {
    setOtpDebugCode(data.devOtp);
   }
   setOtpMobile(cleanMobile);
   setOtpStep(2);
  } catch (err) {
   resetRecaptchaVerifier();
   setOtpError(getFirebaseErrorMessage(err));
  } finally {
   setOtpSubmitting(false);
  }
 };

 const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const cleanCode = otpCode.trim();
  if (!/^\d{6}$/.test(cleanCode)) {
   setOtpError("Enter a valid 6-digit OTP.");
   return;
  }

  setOtpSubmitting(true);
  setOtpError("");

  try {
   if (firebaseOtpConfirmation) {
    const credential = await firebaseOtpConfirmation.confirm(cleanCode);
    const idToken = await credential.user.getIdToken();
    const firebaseClient = await getFirebaseClient();
    const { doc, getDoc } = await import("firebase/firestore");
    const phoneKey = getPhoneLookupKey(otpMobile || credential.user.phoneNumber);
    const phoneDoc = await getDoc(doc(firebaseClient.db, "phone_login", phoneKey));
    if (!phoneDoc.exists()) {
     throw new Error(
      "This mobile number is not registered. Please sign up with email and mobile first.",
     );
    }
    const phoneData = phoneDoc.data();
    const profileDoc = await getDoc(doc(firebaseClient.db, "users", phoneData.uid));
    if (!profileDoc.exists()) {
     throw new Error("User profile not found for this mobile number.");
    }
    const sessionData = {
     success: true,
     token: idToken,
     user: { uid: phoneData.uid, ...profileDoc.data() },
    };

    alert("OTP verified successfully.");
    closeOtpModal();
    completeLogin(sessionData, otpMobile.trim());
    return;
   }

   const response = await fetch(apiUrl("/api/auth/otp/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: otpMobile.trim(), otp: cleanCode }),
   });
   const data = await readJsonResponse(response);
   if (!response.ok) {
    throw new Error(data.error || "OTP verification failed");
   }

   alert("OTP verified successfully.");
   closeOtpModal();
   completeLogin(data, otpMobile.trim());
 } catch (err) {
   setOtpError(getFirebaseErrorMessage(err));
  } finally {
   setOtpSubmitting(false);
  }
 };

 const title =
  mode === "login"
   ? "THE ROYAL CIRCLE"
   : mode === "register"
     ? "JOIN THE HOUSE"
     : "RESET PASSWORD";
 const subtitle =
  mode === "login"
   ? "Log in with email"
   : mode === "register"
     ? "Register with email"
     : "Recover access using email";

 return (
  <main className="login-main-section">
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
      }}
      aria-label="Close"
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
       {title}
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
       {subtitle}
      </p>
     </div>
     <div id="rein-oro-recaptcha" key={recaptchaRenderKey} style={{ display: "none" }} />
     <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
     >
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

      {mode === "register" ? (
        <div className="contact-form-group">
         <label htmlFor="register-email" className="contact-form-label">
          Email Address
         </label>
         <input
          type="email"
          id="register-email"
          className="contact-form-input"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
         />
        </div>
      ) : (
       <div className="contact-form-group">
        <label htmlFor="login-identifier" className="contact-form-label">
         Email or Mobile Number
        </label>
        <input
         type="text"
         id="login-identifier"
         className="contact-form-input"
         placeholder="Enter your email"
         required
         value={identifier}
         onChange={(e) => setIdentifier(e.target.value)}
         disabled={isSubmitting}
        />
       </div>
      )}

      {mode !== "forgot" && (
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
          style={{ paddingRight: "70px" }}
         />
         <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
           position: "absolute",
           top: "50%",
           right: "14px",
           transform: "translateY(-50%)",
           background: "transparent",
           border: "none",
           color: "var(--color-gold)",
           cursor: "pointer",
           fontSize: "0.72rem",
           textTransform: "uppercase",
          }}
         >
          {showPassword ? "Hide" : "Show"}
         </button>
        </div>
       </div>
      )}

      {mode === "login" && (
       <button
        type="button"
        onClick={() => resetForm("forgot")}
        style={{
         alignSelf: "flex-end",
         background: "transparent",
         border: "none",
         color: "var(--color-gold)",
         cursor: "pointer",
         fontSize: "0.78rem",
         padding: 0,
        }}
       >
        Forgot password?
       </button>
      )}

      <button
       type="submit"
       className="btn btn-primary"
       disabled={isSubmitting}
       style={{ width: "100%", height: "44px", marginTop: "0.3rem" }}
      >
       {isSubmitting
        ? "Please wait..."
        : mode === "login"
          ? "SIGN IN"
          : mode === "register"
            ? "CREATE ACCOUNT"
            : "SEND RESET LINK"}
      </button>

     </form>

     <div
      style={{
       marginTop: "1.6rem",
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
         onClick={() => resetForm("register")}
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
         onClick={() => resetForm("login")}
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

  </main>
 );
}
