import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext, CartContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";

export default function Dashboard() {
 const { user, logout } = useContext(AuthContext);
 const { addToCart } = useContext(CartContext);
 const navigate = useNavigate();

 const [activeTab, setActiveTab] = useState("dashboard");
 const [orders, setOrders] = useState([]);
 const [recProducts, setRecProducts] = useState([]);
 const [recIndex, setRecIndex] = useState(0);

 const [addresses, setAddresses] = useState([]);
 const [isEditing, setIsEditing] = useState(false);
 const [currentAddress, setCurrentAddress] = useState(null);
 const [addressForm, setAddressForm] = useState({
  fullName: "",
  street: "",
  city: "",
  pincode: "",
  country: "India",
 });
 const [addressLoading, setAddressLoading] = useState(false);
 const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 const [addressToDelete, setAddressToDelete] = useState(null);

 const executeDeleteAddress = async () => {
  if (!addressToDelete) return;

  setAddressLoading(true);
  const updatedAddresses = addresses.filter((addr) => addr.id !== addressToDelete);

  try {
   const res = await fetch(apiUrl("/api/users/addresses"), {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     email: user.email,
     addresses: updatedAddresses,
    }),
   });

   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Failed to delete address");
   }

   setAddresses(updatedAddresses);
   alert("Address deleted successfully.");
  } catch (err) {
   alert("Error: " + err.message);
  } finally {
   setAddressLoading(false);
   setAddressToDelete(null);
  }
 };

 // Fetch user addresses from database
 useEffect(() => {
  if (!user) return;
  fetch(apiUrl(`/api/users/addresses?email=${encodeURIComponent(user.email)}`))
   .then((res) => {
    if (!res.ok) throw new Error("Failed to load addresses");
    return res.json();
   })
   .then((data) => {
    setAddresses(Array.isArray(data) ? data : []);
   })
   .catch((err) => {
    console.error("Failed to load addresses:", err);
   });
 }, [user]);

 // Auto-fill City via India Post Pincode API
 useEffect(() => {
  const pincode = addressForm.pincode.trim();
  if (pincode.length === 6 && /^\d+$/.test(pincode)) {
   fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    .then((res) => res.json())
    .then((data) => {
     if (data && data[0] && data[0].Status === "Success") {
      const postOffice = data[0].PostOffice && data[0].PostOffice[0];
      if (postOffice) {
       setAddressForm((prev) => ({
        ...prev,
        city: postOffice.District || postOffice.Block || prev.city,
       }));
      }
     }
    })
    .catch((err) => console.error("Pincode API Error:", err));
  }
 }, [addressForm.pincode]);

 const handleOpenAddForm = () => {
  setAddressForm({
   fullName: "",
   street: "",
   city: "",
   pincode: "",
   country: "India",
  });
  setCurrentAddress(null);
  setIsEditing(true);
 };

 const handleOpenEditForm = (addr) => {
  setAddressForm({
   fullName: addr.fullName || "",
   street: addr.street || "",
   city: addr.city || "",
   pincode: addr.pincode || "",
   country: addr.country || "India",
  });
  setCurrentAddress(addr);
  setIsEditing(true);
 };

 const handleSaveAddress = async (e) => {
  e.preventDefault();
  if (
   !addressForm.fullName.trim() ||
   !addressForm.street.trim() ||
   !addressForm.city.trim() ||
   !addressForm.pincode.trim() ||
   !addressForm.country.trim()
  ) {
   alert("Please fill in all address fields.");
   return;
  }

  setAddressLoading(true);
  let updatedAddresses = [];

  if (currentAddress) {
   // Edit mode
   updatedAddresses = addresses.map((addr) =>
    addr.id === currentAddress.id ? { ...addr, ...addressForm } : addr,
   );
  } else {
   // Add mode
   const newAddress = {
    id: Date.now().toString(),
    ...addressForm,
   };
   updatedAddresses = [...addresses, newAddress];
  }

  try {
   const res = await fetch(apiUrl("/api/users/addresses"), {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     email: user.email,
     addresses: updatedAddresses,
    }),
   });

   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Failed to save address");
   }

   setAddresses(updatedAddresses);
   setIsEditing(false);
   alert(
    currentAddress
     ? "Address updated successfully."
     : "Address added successfully.",
   );
  } catch (err) {
   alert("Error: " + err.message);
  } finally {
   setAddressLoading(false);
  }
 };

 // Route Guard
 useEffect(() => {
  if (!user) {
   navigate("/login");
  }
 }, [user, navigate]);

 // Fetch user orders from database
 useEffect(() => {
  if (!user) return;
  fetch(apiUrl(`/api/orders?email=${encodeURIComponent(user.email)}`))
   .then((res) => res.json())
   .then((data) => {
    setOrders(Array.isArray(data) ? data : []);
   })
   .catch((err) => {
    console.error("Failed to load orders:", err);
    setOrders([]);
   });
 }, [user]);

 // Fetch recommendations
 useEffect(() => {
  fetch(apiUrl("/api/products"))
   .then((res) => res.json())
   .then((data) => {
    setRecProducts(data.slice(0, 5));
   })
   .catch((err) => console.error("Failed to load recommendations:", err));
 }, []);

 if (!user) return null;

 // Format greeting name from email prefix
 const username = user.email.split("@")[0];
 const greetingName = username.charAt(0).toUpperCase() + username.slice(1);

 const handleLogoutConfirm = () => {
  logout();
  navigate("/");
 };

 // Recommendations carousel navigation
 const handleRecNext = () => {
  setRecIndex((prev) => Math.min(recProducts.length - 3, prev + 1));
 };
 const handleRecPrev = () => {
  setRecIndex((prev) => Math.max(0, prev - 1));
 };

 const getTrackingSteps = (status = "Processing") => {
  const steps = [
   "Processing",
   "Packed",
   "Shipped",
   "Out for Delivery",
   "Delivered",
  ];
  const normalizedStatus = String(status || "Processing").toLowerCase();
  const currentIndex = Math.max(
   0,
   steps.findIndex((step) => step.toLowerCase() === normalizedStatus),
  );

  return steps.map((step, index) => ({
   label: step,
   done: index <= currentIndex,
  }));
 };

 return (
  <main className="cart-page-main">
   <div className="dashboard-page-container">
    {/* Left Sidebar Menu */}
    <aside
     className="dashboard-sidebar"
     style={{
      border: "1px solid rgba(255,255,255,0.03)",
      borderRadius: "8px",
      padding: "1.5rem",
      backgroundColor: "rgba(15,15,15,0.4)",
     }}
    >
     <div
      className="welcome-greeting"
      style={{
       borderBottom: "1px solid rgba(255,255,255,0.05)",
       paddingBottom: "1.2rem",
       marginBottom: "1.5rem",
       textAlign: "center",
      }}
     >
      <span
       style={{
        fontSize: "0.7rem",
        color: "var(--color-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
       }}
      >
       Welcome back,
      </span>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.5rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginTop: "0.2rem",
       }}
      >
       {greetingName}
      </h3>
      {user.role === "admin" && (
       <span
        style={{
         display: "inline-block",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         fontSize: "0.65rem",
         fontWeight: "bold",
         padding: "0.1rem 0.5rem",
         borderRadius: "10px",
         marginTop: "0.4rem",
         textTransform: "uppercase",
        }}
       >
        Admin Role
       </span>
      )}
     </div>

     <ul
      className="sidebar-menu-list"
      style={{
       listStyle: "none",
       display: "flex",
       flexDirection: "column",
       gap: "0.5rem",
      }}
     >
      {[
       { id: "dashboard", label: "Dashboard Hub" },
       { id: "orders", label: "Order History" },
       { id: "rewards", label: "Royal Rewards" },
       { id: "addresses", label: "Saved Addresses" },
      ].map((tab) => (
       <li key={tab.id}>
        <button
         onClick={() => setActiveTab(tab.id)}
         style={{
          width: "100%",
          textAlign: "left",
          background:
           activeTab === tab.id ? "rgba(201,168,76,0.06)" : "transparent",
          border: "none",
          color:
           activeTab === tab.id ? "var(--color-gold)" : "var(--color-muted)",
          padding: "0.6rem 1rem",
          fontSize: "0.82rem",
          cursor: "pointer",
          borderRadius: "4px",
          fontWeight: activeTab === tab.id ? 600 : 400,
          borderLeft:
           activeTab === tab.id ? "2px solid var(--color-gold)" : "none",
          transition: "all 0.2s",
         }}
        >
         {tab.label}
        </button>
       </li>
      ))}

      <li
       style={{
        marginTop: "1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "1.2rem",
       }}
      >
       <button
        onClick={() => setShowLogoutConfirm(true)}
        style={{
         width: "100%",
         textAlign: "left",
         background: "transparent",
         border: "none",
         color: "rgba(255,50,50,0.8)",
         padding: "0.6rem 1rem",
         fontSize: "0.82rem",
         cursor: "pointer",
        }}
       >
        Logout Sign Out
       </button>
      </li>
     </ul>
    </aside>

    {/* Right Main Content Area */}
    <section
     className="dashboard-content-area"
     style={{ flex: 1, minWidth: 0 }}
    >
     {activeTab === "dashboard" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
       {/* Summary Cards */}
       <div className="dashboard-summary-grid">
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Total Orders
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          {orders.length}
         </h4>
        </div>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Rewards points
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-gold)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          320 pts
         </h4>
        </div>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Wishlist items
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          2
         </h4>
        </div>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Saved Addresses
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          {addresses.length}
         </h4>
        </div>
       </div>

       {/* Recent Orders Log Table */}
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.04)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "rgba(15,15,15,0.4)",
        }}
       >
        <h3
         style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.4rem",
          fontWeight: 300,
          color: "var(--color-white)",
          marginBottom: "1.5rem",
         }}
        >
         Recent Orders
        </h3>
        {orders.length === 0 ? (
         <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
          No orders found in your account history. Place an order to see it
          logged here.
         </p>
        ) : (
         <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.slice(0, 3).map((order) => (
           <div
            key={order.id}
            style={{
             display: "flex",
             justifyContent: "space-between",
             alignItems: "center",
             padding: "1.2rem",
             border: "1px solid rgba(255,255,255,0.03)",
             borderRadius: "6px",
             backgroundColor: "rgba(5,5,5,0.2)",
            }}
           >
            <div>
             <h4
              style={{
               fontSize: "0.88rem",
               color: "var(--color-white)",
               fontWeight: 600,
              }}
             >
              Order #{order.id}
             </h4>
             <p style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>
              {order.date} &bull; {order.items?.length || 0} Items
             </p>
            </div>
            <div
             style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
             <span
              style={{
               backgroundColor:
                order.status === "Delivered"
                 ? "rgba(50,200,50,0.1)"
                 : "rgba(201,168,76,0.1)",
               color:
                order.status === "Delivered" ? "#32c832" : "var(--color-gold)",
               fontSize: "0.7rem",
               fontWeight: "bold",
               padding: "0.2rem 0.6rem",
               borderRadius: "4px",
               textTransform: "uppercase",
              }}
             >
              {order.status}
             </span>
             <span
              style={{
               fontSize: "0.95rem",
               color: "var(--color-white)",
               fontWeight: 600,
              }}
             >
              ₹{order.total}
             </span>
            </div>
           </div>
          ))}
         </div>
        )}
       </div>

       {/* Slider recommendations */}
       <div>
        <div
         style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
         }}
        >
         <h3
          style={{
           fontFamily: "var(--font-heading)",
           fontSize: "1.4rem",
           fontWeight: 300,
           color: "var(--color-white)",
          }}
         >
          Exclusive Recommendations
         </h3>
         {recProducts.length > 3 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
           <button
            className="arrow-left"
            onClick={handleRecPrev}
            disabled={recIndex === 0}
            style={{
             width: "28px",
             height: "28px",
             borderRadius: "50%",
             background: "transparent",
             border: "1px solid rgba(255,255,255,0.1)",
             color: "var(--color-gold)",
             cursor: "pointer",
             opacity: recIndex === 0 ? 0.3 : 1,
            }}
           >
            &lt;
           </button>
           <button
            className="arrow-right"
            onClick={handleRecNext}
            disabled={recIndex >= recProducts.length - 3}
            style={{
             width: "28px",
             height: "28px",
             borderRadius: "50%",
             background: "transparent",
             border: "1px solid rgba(255,255,255,0.1)",
             color: "var(--color-gold)",
             cursor: "pointer",
             opacity: recIndex >= recProducts.length - 3 ? 0.3 : 1,
            }}
           >
            &gt;
           </button>
          </div>
         )}
        </div>

        <div
         className="slider-viewport"
         style={{ overflow: "hidden", width: "100%" }}
        >
         <div
          className="slider-track"
          style={{
           display: "flex",
           gap: "1.5rem",
           transition: "transform 0.4s ease",
           transform: `translateX(-${recIndex * 280}px)`,
          }}
         >
          {recProducts.map((p) => (
           <div key={p.id} style={{ minWidth: "256px", maxWidth: "256px" }}>
            <div className="product-card" style={{ padding: "1.5rem 1rem" }}>
             <div
              className="product-image-wrapper"
              style={{
               height: "140px",
               aspectRatio: "auto",
               marginBottom: "1rem",
              }}
             >
              <Link to={`/product/${p.id}`}>
               <img
                src={p.image}
                alt={p.title}
                style={{ maxHeight: "110px" }}
               />
              </Link>
             </div>
             <div className="product-info" style={{ textAlign: "center" }}>
              <h4
               style={{
                fontSize: "1rem",
                color: "var(--color-white)",
                fontWeight: 500,
               }}
              >
               {p.name}
              </h4>
              <p
               style={{
                fontSize: "0.68rem",
                color: "var(--color-muted)",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
               }}
              >
               {p.flavor}
              </p>
              <span style={{ fontSize: "0.88rem", color: "var(--color-gold)" }}>
               ₹{p.price}
              </span>
              <button
               className="btn btn-outline"
               onClick={() => addToCart(p, 1)}
               style={{
                width: "100%",
                height: "32px",
                fontSize: "0.65rem",
                padding: 0,
                marginTop: "0.8rem",
               }}
              >
               Add to Bag
              </button>
             </div>
            </div>
           </div>
          ))}
         </div>
        </div>
       </div>
      </div>
     )}

     {activeTab === "orders" && (
      <div
       style={{
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "2rem",
        backgroundColor: "rgba(15,15,15,0.4)",
       }}
      >
       <h2
        style={{
         fontFamily: "var(--font-heading)",
         fontSize: "1.8rem",
         fontWeight: 300,
         color: "var(--color-white)",
         marginBottom: "2rem",
        }}
       >
        Your Complete Order History
       </h2>
       {orders.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
         No orders placed yet.
        </p>
       ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         {orders.map((order) => (
          <div
           key={order.id}
           style={{
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "6px",
            backgroundColor: "rgba(5,5,5,0.2)",
            overflow: "hidden",
           }}
          >
           {/* Order Title row */}
           <div
            style={{
             display: "flex",
             justifyContent: "space-between",
             padding: "1rem 1.5rem",
             backgroundColor: "rgba(255,255,255,0.01)",
             borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}
           >
            <div>
             <span
              style={{
               fontSize: "0.85rem",
               fontWeight: 600,
               color: "var(--color-white)",
              }}
             >
              Order ID: #{order.id}
             </span>
             <span
              style={{
               fontSize: "0.75rem",
               color: "var(--color-muted)",
               marginLeft: "1rem",
              }}
             >
              Placed: {order.date}
             </span>
            </div>
            <span
             style={{
              backgroundColor:
               order.status === "Delivered"
                ? "rgba(50,200,50,0.1)"
                : "rgba(201,168,76,0.1)",
              color:
               order.status === "Delivered" ? "#32c832" : "var(--color-gold)",
              fontSize: "0.65rem",
              fontWeight: "bold",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              textTransform: "uppercase",
             }}
            >
             {order.status}
            </span>
           </div>

           {/* Items loop */}
           <div style={{ padding: "1.5rem" }}>
            {order.items?.map((item, index) => (
             <div
              key={index}
              style={{
               display: "flex",
               gap: "1rem",
               alignItems: "center",
               marginBottom: index === order.items.length - 1 ? 0 : "1rem",
              }}
             >
              <div
               style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(5,5,5,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                border: "1px solid rgba(255,255,255,0.04)",
               }}
              >
               <img
                src={item.image}
                alt={item.name}
                style={{
                 maxWidth: "80%",
                 maxHeight: "80%",
                 objectFit: "contain",
                }}
               />
              </div>
              <div style={{ flex: 1 }}>
               <h5
                style={{
                 fontSize: "0.82rem",
                 color: "var(--color-white)",
                 fontWeight: 500,
                }}
               >
                {item.name}
               </h5>
               <p style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>
                {item.flavor} &bull; Qty: {item.qty} &bull; {item.weight}
               </p>
              </div>
              <span
               style={{ fontSize: "0.82rem", color: "var(--color-white)" }}
              >
               ₹{item.price * item.qty}
              </span>
             </div>
            ))}
           </div>

           {/* Totals tally */}
           <div
            style={{
             display: "flex",
             justifyContent: "space-between",
             padding: "1rem 1.5rem",
             borderTop: "1px solid rgba(255,255,255,0.03)",
             fontSize: "0.82rem",
             color: "var(--color-muted)",
            }}
           >
            <span>Method: {order.payment_method}</span>
            <span>
             Total Paid:{" "}
             <strong
              style={{ color: "var(--color-gold)", fontSize: "0.95rem" }}
             >
              ₹{order.total}
             </strong>
            </span>
           </div>

           <div
            style={{
             padding: "0 1.5rem 1.3rem",
             borderTop: "1px solid rgba(255,255,255,0.03)",
            }}
           >
            <p
             style={{
              fontSize: "0.75rem",
              color: "var(--color-muted)",
              marginBottom: "0.8rem",
             }}
            >
             Estimated Delivery:{" "}
             <strong style={{ color: "var(--color-gold)" }}>
              {order.est_delivery || "Updating soon"}
             </strong>
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
             {getTrackingSteps(order.status).map((step) => (
              <span
               key={step.label}
               style={{
                fontSize: "0.68rem",
                padding: "0.25rem 0.55rem",
                borderRadius: "999px",
                backgroundColor: step.done
                 ? "rgba(201,168,76,0.16)"
                 : "rgba(255,255,255,0.05)",
                color: step.done ? "var(--color-gold)" : "var(--color-muted)",
                border: step.done
                 ? "1px solid rgba(201,168,76,0.35)"
                 : "1px solid rgba(255,255,255,0.06)",
               }}
              >
               {step.label}
              </span>
             ))}
            </div>
           </div>
          </div>
         ))}
        </div>
       )}
      </div>
     )}

     {activeTab === "rewards" && (
      <div
       style={{
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: "8px",
        padding: "3rem",
        backgroundColor: "rgba(201,168,76,0.02)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.2rem",
       }}
      >
       <div
        style={{
         width: "64px",
         height: "64px",
         borderRadius: "50%",
         border: "2px solid var(--color-gold)",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         color: "var(--color-gold)",
         fontSize: "1.8rem",
        }}
       >
        👑
       </div>
       <h2
        style={{
         fontFamily: "var(--font-heading)",
         fontSize: "1.8rem",
         fontWeight: 300,
         color: "var(--color-white)",
        }}
       >
        Royal Rewards Club
       </h2>
       <p
        style={{
         fontSize: "0.9rem",
         color: "var(--color-muted)",
         maxWidth: "500px",
         lineHeight: 1.6,
        }}
       >
        You have accumulated{" "}
        <strong style={{ color: "var(--color-gold)" }}>320 Royal Points</strong>
        . Earn 10 points for every ₹100 spent on gourmet delicacies. Redeem
        points at checkout for complimentary gift hampers and custom tastings.
       </p>
       <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
         className="btn btn-primary"
         onClick={() => alert("Reward catalog selection is simulated.")}
         style={{ height: "40px", padding: "0 1.5rem" }}
        >
         Redeem points
        </button>
        <Link
         to="/shop"
         className="btn btn-outline"
         style={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 1.5rem",
         }}
        >
         Earn more
        </Link>
       </div>
      </div>
     )}

     {activeTab === "addresses" && (
      <div
       style={{
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "2rem",
        backgroundColor: "rgba(15,15,15,0.4)",
       }}
      >
       <div
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h2
         style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.8rem",
          fontWeight: 300,
          color: "var(--color-white)",
          margin: 0,
         }}
        >
         Saved Addresses
        </h2>
        {!isEditing && (
         <button
          className="btn btn-outline"
          onClick={handleOpenAddForm}
          style={{
           height: "36px",
           fontSize: "0.75rem",
           padding: "0 1.2rem",
           border: "1px solid var(--color-gold)",
           color: "var(--color-gold)",
          }}
         >
          + Add New Address
         </button>
        )}
       </div>

       {isEditing ? (
        <form
         onSubmit={handleSaveAddress}
         style={{
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "6px",
          padding: "2rem",
          backgroundColor: "rgba(5,5,5,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          maxWidth: "600px",
         }}
        >
         <h3
          style={{
           fontFamily: "var(--font-heading)",
           fontSize: "1.2rem",
           color: "var(--color-white)",
           fontWeight: 400,
           marginBottom: "0.5rem",
           borderBottom: "1px solid rgba(255,255,255,0.05)",
           paddingBottom: "0.5rem",
          }}
         >
          {currentAddress ? "Edit Saved Address" : "Add New Address"}
         </h3>

         <div className="contact-form-group">
          <label htmlFor="fullName" className="contact-form-label">
           Name / Label
          </label>
          <input
           type="text"
           id="fullName"
           className="contact-form-input"
           placeholder="e.g. Home, Office, Vaibhav Bharti"
           required
           value={addressForm.fullName}
           onChange={(e) =>
            setAddressForm({ ...addressForm, fullName: e.target.value })
           }
          />
         </div>

         <div className="contact-form-group">
          <label htmlFor="street" className="contact-form-label">
           Street Address
          </label>
          <input
           type="text"
           id="street"
           className="contact-form-input"
           placeholder="e.g. 12-A Connaught Place, Block C"
           required
           value={addressForm.street}
           onChange={(e) =>
            setAddressForm({ ...addressForm, street: e.target.value })
           }
          />
         </div>

         <div
          className="checkout-form-row"
          style={{ display: "flex", gap: "1rem" }}
         >
          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="pincode" className="contact-form-label">
            Pincode
           </label>
           <input
            type="text"
            id="pincode"
            className="contact-form-input"
            placeholder="6-digit Pincode"
            required
            value={addressForm.pincode}
            onChange={(e) =>
             setAddressForm({ ...addressForm, pincode: e.target.value })
            }
           />
          </div>

          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="city" className="contact-form-label">
            City
           </label>
           <input
            type="text"
            id="city"
            className="contact-form-input"
            placeholder="City"
            required
            value={addressForm.city}
            onChange={(e) =>
             setAddressForm({ ...addressForm, city: e.target.value })
            }
           />
          </div>
         </div>

         <div className="contact-form-group">
          <label htmlFor="country" className="contact-form-label">
           Country
          </label>
          <input
           type="text"
           id="country"
           className="contact-form-input"
           placeholder="Country"
           required
           value={addressForm.country}
           onChange={(e) =>
            setAddressForm({ ...addressForm, country: e.target.value })
           }
          />
         </div>

         <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           disabled={addressLoading}
           style={{
            height: "40px",
            padding: "0 2rem",
            backgroundColor: "var(--color-gold)",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
           }}
          >
           {addressLoading ? "Saving..." : "Save Address"}
          </button>
          <button
           type="button"
           className="btn btn-outline"
           onClick={() => setIsEditing(false)}
           style={{
            height: "40px",
            padding: "0 2rem",
            backgroundColor: "transparent",
            color: "var(--color-white)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            borderRadius: "4px",
           }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div>
         {addresses.length === 0 ? (
          <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
           No saved addresses. Add a new address to speed up your checkout
           process.
          </p>
         ) : (
          <div
           style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
           }}
          >
           {addresses.map((addr) => (
            <div
             key={addr.id}
             style={{
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "6px",
              padding: "1.5rem",
              backgroundColor: "rgba(5,5,5,0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
             }}
            >
             <div>
              <h4
               style={{
                fontSize: "0.95rem",
                color: "var(--color-white)",
                fontWeight: 600,
                marginBottom: "0.6rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
               }}
              >
               <span>{addr.fullName}</span>
               <span
                style={{
                 fontSize: "0.65rem",
                 color: "var(--color-gold)",
                 border: "1px solid rgba(201,168,76,0.2)",
                 padding: "0.1rem 0.4rem",
                 borderRadius: "3px",
                 textTransform: "uppercase",
                }}
               >
                Saved
               </span>
              </h4>
              <p
               style={{
                fontSize: "0.82rem",
                color: "var(--color-muted)",
                lineHeight: 1.5,
                marginBottom: "1.5rem",
               }}
              >
               {addr.street}
               <br />
               {addr.city} - {addr.pincode}
               <br />
               {addr.country}
              </p>
             </div>
             <div
              style={{
               display: "flex",
               gap: "0.8rem",
               borderTop: "1px solid rgba(255,255,255,0.05)",
               paddingTop: "1rem",
              }}
             >
              <button
               className="btn btn-outline"
               onClick={() => handleOpenEditForm(addr)}
               disabled={addressLoading}
               style={{
                height: "30px",
                fontSize: "0.7rem",
                padding: "0 0.8rem",
                flex: 1,
                borderColor: "rgba(201,168,76,0.3)",
                color: "var(--color-gold)",
               }}
              >
               Edit
              </button>
              <button
               className="btn btn-outline"
               onClick={() => setAddressToDelete(addr.id)}
               disabled={addressLoading}
               style={{
                height: "30px",
                fontSize: "0.7rem",
                padding: "0 0.8rem",
                flex: 1,
                borderColor: "rgba(255,80,80,0.2)",
                color: "rgba(255,80,80,0.8)",
               }}
              >
               Delete
              </button>
             </div>
            </div>
           ))}
          </div>
         )}
        </div>
       )}
      </div>
     )}
    </section>
   </div>

   {/* Custom Logout Confirmation Dialog Modal */}
   {showLogoutConfirm && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <div
      style={{
       width: "100%",
       maxWidth: "400px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       textAlign: "center",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
      }}
     >
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>👑</div>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.8rem",
       }}
      >
       Sign Out
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       Are you sure you want to sign out from your royal account?
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={handleLogoutConfirm}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         border: "none",
         fontWeight: "bold",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        YES, SIGN OUT
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setShowLogoutConfirm(false)}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "transparent",
         color: "var(--color-white)",
         border: "1px solid rgba(255,255,255,0.2)",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        CANCEL
       </button>
      </div>
     </div>
    </div>
   )}

   {/* Custom Address Deletion Confirmation Dialog Modal */}
   {addressToDelete && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <div
      style={{
       width: "100%",
       maxWidth: "400px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(255, 80, 80, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       textAlign: "center",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
      }}
     >
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🗑️</div>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.8rem",
       }}
      >
       Delete Address
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       Are you sure you want to permanently delete this saved address? This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={executeDeleteAddress}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "#ff5050",
         color: "#fff",
         border: "none",
         fontWeight: "bold",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        YES, DELETE
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setAddressToDelete(null)}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "transparent",
         color: "var(--color-white)",
         border: "1px solid rgba(255,255,255,0.2)",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        CANCEL
       </button>
      </div>
     </div>
    </div>
   )}
  </main>
 );
}
