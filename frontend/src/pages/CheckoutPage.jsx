import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, verifyPayment, createPayment, calculateTax, fetchSessionOrders } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiPrinter, FiHome, FiCreditCard, FiPlus, FiXCircle } from "react-icons/fi";

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart, activeSessionId, setActiveSessionId, endSession } = useCart();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ SESSION DATA — holds cumulative receipt from all rounds
  const [sessionData, setSessionData] = useState(null);

  // ✅ STATE FOR TAX DETAILS FROM BACKEND
  const [taxDetails, setTaxDetails] = useState({ cgst: 0, sgst: 0, total: totalPrice });

  // ✅ FETCH TAX FROM BACKEND WHENEVER TOTALPRICE CHANGES
  useEffect(() => {
    if (totalPrice > 0) {
      calculateTax({ subtotal: totalPrice })
        .then((res) => {
          setTaxDetails(res.data);
        })
        .catch((err) => {
          console.error("Error calculating tax:", err);
          const cgst = totalPrice * 0.025;
          const sgst = totalPrice * 0.025;
          setTaxDetails({ cgst, sgst, total: totalPrice + cgst + sgst });
        });
    } else {
      setTaxDetails({ cgst: 0, sgst: 0, total: 0 });
    }
  }, [totalPrice]);

  // ✅ FETCH SESSION DATA after successful order
  const loadSessionData = async (sessionId) => {
    try {
      const res = await fetchSessionOrders(sessionId);
      setSessionData(res.data);
    } catch (err) {
      console.error("Error loading session data:", err);
    }
  };

  const handleOrder = async () => {
    try {
      if (!cart || cart.length === 0) {
        alert("Your cart is empty! Please add some items before checking out.");
        return;
      }

      const tableNumber = localStorage.getItem("tableNumber");

      if (!tableNumber || tableNumber === "undefined" || tableNumber === "null") {
        alert("Please scan a table QR code before placing an order. No table number found.");
        return;
      }

      setIsProcessing(true);
      const itemNames = cart.map(i => `${i.quantity}x ${i.name}`).join(", ");

      const orderData = {
        order_type: "dine_in",
        table_number: parseInt(tableNumber, 10),
        item_names: itemNames,
        total_price: taxDetails.total,
      };

      // ✅ If session exists, attach it (subsequent order in same dining session)
      if (activeSessionId) {
        orderData.session_id = activeSessionId;
      }

      // 1. Create Payment Order first
      const paymentRes = await createPayment({ total_price: taxDetails.total });
      
      if (!paymentRes.data.razorpay_order_id) {
        setIsProcessing(false);
        alert("Failed to initialize payment.");
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      
      if (!res) {
        setIsProcessing(false);
        alert("Razorpay SDK failed to load. Are you offline?");
        return;
      }

      // 3. Open Razorpay Popup
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || paymentRes.data.key_id,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency,
        name: "RestroScan",
        description: activeSessionId ? "Additional Order Payment" : "Payment for Order",
        order_id: paymentRes.data.razorpay_order_id,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };
            
            // 4. Verify Payment
            console.log("Step 4: Verifying payment...");
            let verifyRes;
            try {
              verifyRes = await verifyPayment(verificationData);
              console.log("Verification response:", verifyRes.status, verifyRes.data);
            } catch (verifyErr) {
              console.error("VERIFY FAILED:", verifyErr?.response?.data || verifyErr);
              alert("Payment verification failed: " + JSON.stringify(verifyErr?.response?.data || verifyErr.message));
              setIsProcessing(false);
              return;
            }
            
            if (verifyRes.status === 200) {
                // 5. Place Order after verification
                const finalOrderData = {
                  ...orderData,
                  ...verificationData
                };
                
                console.log("Step 5: Placing order with data:", finalOrderData);
                let orderRes;
                try {
                  orderRes = await placeOrder(finalOrderData);
                  console.log("Order response:", orderRes.status, orderRes.data);
                } catch (orderErr) {
                  console.error("ORDER CREATION FAILED:", orderErr?.response?.data || orderErr);
                  alert("Order creation failed: " + JSON.stringify(orderErr?.response?.data || orderErr.message));
                  setIsProcessing(false);
                  return;
                }
                
                // ✅ Save session_id from backend response
                const returnedSessionId = orderRes.data.order.session_id;
                if (returnedSessionId) {
                  setActiveSessionId(returnedSessionId);
                }

                // Set the receipt data and switch UI to success mode
                setOrderDetails({
                  id: orderRes.data.order.id,
                  items: [...cart],
                  subtotal: totalPrice,
                  cgst: taxDetails.cgst,
                  sgst: taxDetails.sgst,
                  total: taxDetails.total,
                  date: new Date(),
                  session_id: returnedSessionId,
                });

                // ✅ Load full session data for cumulative receipt
                if (returnedSessionId) {
                  await loadSessionData(returnedSessionId);
                }

                setIsSuccess(true);
                clearCart();
            }
          } catch (err) {
            console.error("Unexpected Error:", err);
            alert("Unexpected error: " + (err?.response?.data ? JSON.stringify(err.response.data) : err.message));
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
            ondismiss: function() {
                setIsProcessing(false);
            }
        },
        prefill: {
          name: "Dine In User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#ff5722" // Premium Orange Theme
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Order error:", err?.response?.data || err);
      setIsProcessing(false);
      
      const errorMsg = err?.response?.data?.error || err?.response?.data || err.message;
      alert("Error initializing payment: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
    }
  };

  // ✅ HANDLE "ORDER MORE" — go back to menu, keep session alive
  const handleOrderMore = () => {
    navigate("/");
  };

  // ✅ HANDLE "CLOSE BILL" — end session, clear everything
  const handleCloseBill = () => {
    endSession();
    navigate("/");
  };

  // =============================================
  // ✅ SUCCESS / RECEIPT VIEW
  // =============================================
  if (isSuccess && orderDetails) {
    const isMultiRound = sessionData && sessionData.rounds && sessionData.rounds.length > 1;

    return (
      <div className="page-wrapper" style={{ background: "#f8f9fa", padding: "60px 20px", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        
        {/* Success Header Card (OUTSIDE RECEIPT AREA SO IT DOESN'T PRINT) */}
        <div className="no-print" style={{ maxWidth: "550px", margin: "0 auto 25px auto", background: "#ffffff", borderRadius: "16px", padding: "40px 30px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", borderRadius: "50%", background: "#d1e7dd", marginBottom: "20px" }}>
            <FiCheckCircle size={45} color="#0f5132" />
          </div>
          <h2 style={{ color: "#0f5132", fontSize: "28px", fontWeight: "700", margin: "0 0 10px 0" }}>Payment Successful!</h2>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "16px" }}>
            {isMultiRound
              ? "Additional items added to your order! Below is your updated bill."
              : "Your order has been placed successfully. Below is your bill."
            }
          </p>
        </div>

        <div id="receipt-area" style={{ maxWidth: "550px", margin: "0 auto", background: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 10px 0", color: "#212529", letterSpacing: "1px" }}>RESTROSCAN</h3>
              {sessionData && sessionData.table_number && (
                <p style={{ margin: "0 0 5px 0", color: "#e65100", fontSize: "14px", fontWeight: "600", background: "#fff3e0", display: "inline-block", padding: "4px 14px", borderRadius: "20px" }}>
                  🍽️ Table #{sessionData.table_number}
                </p>
              )}
              <p style={{ margin: "5px 0", color: "#adb5bd", fontSize: "14px" }}>
                {new Date().toLocaleString()}
              </p>
            </div>

            <hr style={{ border: "none", borderTop: "2px dashed #e9ecef", margin: "0 0 20px 0" }} />

            {/* ✅ MULTI-ROUND RECEIPT — show all rounds from session */}
            {isMultiRound && sessionData ? (
              <>
                {sessionData.rounds.map((round) => (
                  <div key={round.order_id} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#fff",
                        background: round.round === sessionData.rounds.length ? "#ff5722" : "#6c757d",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        letterSpacing: "0.5px"
                      }}>
                        ROUND {round.round} {round.round === sessionData.rounds.length && "✨ NEW"}
                      </span>
                      <span style={{ fontSize: "13px", color: "#adb5bd" }}>
                        Order #{round.order_id}
                      </span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginBottom: "8px" }}>
                      <tbody>
                        {round.item_names.split(", ").map((itemStr, idx) => {
                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid #f8f9fa" }}>
                              <td style={{ padding: "8px 0", color: "#495057", fontWeight: "500" }}>{itemStr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#495057", paddingBottom: "10px", borderBottom: "1px solid #e9ecef" }}>
                      <span style={{ fontWeight: "500" }}>Round {round.round} Subtotal</span>
                      <span style={{ fontWeight: "600" }}>₹{round.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                {/* Cumulative totals */}
                <hr style={{ border: "none", borderTop: "2px dashed #e9ecef", margin: "10px 0 20px 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "10px" }}>
                  <span>Combined Subtotal</span>
                  <span style={{ fontWeight: "600" }}>₹{sessionData.cumulative_subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "5px" }}>
                  <span>CGST (2.5%)</span>
                  <span style={{ fontWeight: "500" }}>₹{sessionData.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "20px" }}>
                  <span>SGST (2.5%)</span>
                  <span style={{ fontWeight: "500" }}>₹{sessionData.sgst.toFixed(2)}</span>
                </div>

                <hr style={{ border: "none", borderTop: "2px dashed #e9ecef", margin: "0 0 20px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: "800", color: "#212529" }}>
                  <span>Grand Total</span>
                  <span style={{ color: "#ff5722" }}>₹{sessionData.grand_total.toFixed(2)}</span>
                </div>
              </>
            ) : (
              /* ✅ SINGLE ORDER RECEIPT — same as before */
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px", marginBottom: "20px" }}>
                  <thead>
                    <tr style={{ color: "#495057", fontWeight: "600", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}>
                      <td style={{ padding: "10px 0", textAlign: "left", borderBottom: "2px solid #e9ecef" }}>Item</td>
                      <td style={{ padding: "10px 0", textAlign: "center", borderBottom: "2px solid #e9ecef" }}>Qty</td>
                      <td style={{ padding: "10px 0", textAlign: "right", borderBottom: "2px solid #e9ecef" }}>Price</td>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.items.map(item => {
                      const displayPrice = item.final_price || item.price;
                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                          <td style={{ padding: "15px 0", color: "#212529", fontWeight: "500" }}>{item.name}</td>
                          <td style={{ padding: "15px 0", textAlign: "center", color: "#6c757d" }}>{item.quantity}</td>
                          <td style={{ padding: "15px 0", textAlign: "right", color: "#212529", fontWeight: "500" }}>₹{(displayPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "10px" }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: "500" }}>₹{orderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "5px" }}>
                  <span>CGST (2.5%)</span>
                  <span style={{ fontWeight: "500" }}>₹{orderDetails.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "20px" }}>
                  <span>SGST (2.5%)</span>
                  <span style={{ fontWeight: "500" }}>₹{orderDetails.sgst.toFixed(2)}</span>
                </div>

                <hr style={{ border: "none", borderTop: "2px dashed #e9ecef", margin: "0 0 20px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: "800", color: "#212529" }}>
                  <span>Total</span>
                  <span style={{ color: "#ff5722" }}>₹{orderDetails.total.toFixed(2)}</span>
                </div>
              </>
            )}

          {/* ✅ ACTION BUTTONS */}
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "30px" }}>
            
            {/* Order More Button — prominent */}
            <button 
              onClick={handleOrderMore} 
              style={{ 
                width: "100%", 
                padding: "16px", 
                background: "linear-gradient(135deg, #ff5722, #ff7043)", 
                color: "#fff", 
                border: "none", 
                borderRadius: "12px", 
                fontWeight: "700", 
                fontSize: "16px", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "10px", 
                transition: "all 0.3s ease", 
                boxShadow: "0 6px 20px rgba(255,87,34,0.35)",
                letterSpacing: "0.3px"
              }}
            >
              <FiPlus size={20} /> Order More Dishes
            </button>

            {/* Bottom Row — Print & Close Bill */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => window.print()} 
                style={{ 
                  flex: 1, 
                  padding: "14px", 
                  background: "#f8f9fa", 
                  color: "#495057", 
                  border: "1px solid #dee2e6", 
                  borderRadius: "10px", 
                  fontWeight: "600", 
                  fontSize: "14px", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  transition: "all 0.2s" 
                }}
              >
                <FiPrinter size={18} /> Download Bill
              </button>
              <button 
                onClick={handleCloseBill} 
                style={{ 
                  flex: 1, 
                  padding: "14px", 
                  background: "#212529", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "10px", 
                  fontWeight: "600", 
                  fontSize: "14px", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  transition: "all 0.2s" 
                }}
              >
                <FiXCircle size={18} /> Close Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // ✅ CHECKOUT VIEW (before payment)
  // =============================================
  return (
    <div className="page-wrapper" style={{ background: "#f8f9fa", padding: "40px 20px", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "30px", color: "#212529", textAlign: "center", letterSpacing: "-0.5px" }}>
          Secure Checkout
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
          
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            
            {/* TABLE BADGE */}
            {localStorage.getItem("tableNumber") && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff3e0", border: "1px solid #ff9800", borderRadius: "10px", padding: "15px 20px", marginBottom: "30px", fontSize: "16px", color: "#e65100", fontWeight: "600" }}>
                <span style={{ fontSize: "20px" }}>🍽️</span> Dining at Table <span style={{ color: "#ff5722", fontSize: "18px" }}>#{localStorage.getItem("tableNumber")}</span>
              </div>
            )}

            {/* ✅ EXISTING SESSION BANNER */}
            {activeSessionId && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#e8f5e9", border: "1px solid #66bb6a", borderRadius: "10px", padding: "15px 20px", marginBottom: "30px", fontSize: "15px", color: "#2e7d32", fontWeight: "600" }}>
                <span style={{ fontSize: "20px" }}>🔄</span> Adding more items to your existing order
              </div>
            )}

            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#212529", marginBottom: "20px", borderBottom: "2px solid #f8f9fa", paddingBottom: "10px" }}>
              {activeSessionId ? "Additional Items" : "Order Summary"}
            </h3>

            {/* ORDER ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
              {cart.map(item => {
                const displayPrice = item.final_price || item.price;
                return (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8f9fa", fontSize: "16px" }}>
                    <span style={{ color: "#495057", fontWeight: "500" }}>
                      <span style={{ color: "#adb5bd", marginRight: "10px" }}>{item.quantity}x</span> 
                      {item.name}
                    </span>
                    <span style={{ fontWeight: "600", color: "#212529" }}>
                      ₹{(displayPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* PRICE BREAKDOWN */}
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "20px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#495057", marginBottom: "10px" }}>
                <span>{activeSessionId ? "This Round Subtotal" : "Subtotal"}</span>
                <span style={{ fontWeight: "600" }}>₹{totalPrice.toFixed(2)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#6c757d", marginBottom: "5px" }}>
                <span>CGST (2.5%)</span>
                <span>₹{taxDetails.cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#6c757d", marginBottom: "15px" }}>
                <span>SGST (2.5%)</span>
                <span>₹{taxDetails.sgst.toFixed(2)}</span>
              </div>

              <hr style={{ margin: "15px 0", border: "none", borderTop: "2px dashed #dee2e6" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "700", fontSize: "18px", color: "#212529" }}>
                  {activeSessionId ? "This Round Total" : "Total Amount"}
                </span>
                <span style={{ color: "#ff5722", fontWeight: "800", fontSize: "24px" }}>₹{taxDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {/* PLACE ORDER BUTTON */}
            <button
              onClick={handleOrder}
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "18px",
                background: isProcessing ? "#6c757d" : "#ff5722",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: isProcessing ? "not-allowed" : "pointer",
                fontSize: "18px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                boxShadow: isProcessing ? "none" : "0 8px 20px rgba(255,87,34,0.3)"
              }}
            >
              <FiCreditCard size={22} />
              {isProcessing ? "PROCESSING PAYMENT..." : (activeSessionId ? "PAY & ADD TO ORDER" : "PAY & PLACE ORDER")}
            </button>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#adb5bd", marginTop: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              🔒 Secured by Razorpay
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;