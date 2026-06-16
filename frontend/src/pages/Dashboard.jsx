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

 const handleLogout = () => {
  if (confirm("Are you sure you want to sign out from your royal account?")) {
   logout();
   navigate("/");
  }
 };

 // Recommendations carousel navigation
 const handleRecNext = () => {
  setRecIndex((prev) => Math.min(recProducts.length - 3, prev + 1));
 };
 const handleRecPrev = () => {
  setRecIndex((prev) => Math.max(0, prev - 1));
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
        onClick={handleLogout}
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
          1
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
       <h2
        style={{
         fontFamily: "var(--font-heading)",
         fontSize: "1.8rem",
         fontWeight: 300,
         color: "var(--color-white)",
         marginBottom: "1.5rem",
        }}
       >
        Saved Addresses
       </h2>
       <div
        style={{
         border: "1px solid rgba(201,168,76,0.15)",
         borderRadius: "6px",
         padding: "1.5rem",
         backgroundColor: "rgba(5,5,5,0.2)",
         maxWidth: "400px",
        }}
       >
        <h4
         style={{
          fontSize: "0.9rem",
          color: "var(--color-white)",
          fontWeight: 600,
          marginBottom: "0.4rem",
         }}
        >
         Default Delivery Address
        </h4>
        <p
         style={{
          fontSize: "0.82rem",
          color: "var(--color-muted)",
          lineHeight: 1.5,
         }}
        >
         {greetingName} Royal Address
         <br />
         12-A Connaught Place, Block C<br />
         New Delhi, 110001
         <br />
         India
        </p>
        <button
         className="btn btn-outline"
         onClick={() => alert("Address modification is simulated.")}
         style={{
          height: "32px",
          fontSize: "0.7rem",
          padding: "0 1rem",
          marginTop: "1rem",
         }}
        >
         Edit Address
        </button>
       </div>
      </div>
     )}
    </section>
   </div>
  </main>
 );
}
