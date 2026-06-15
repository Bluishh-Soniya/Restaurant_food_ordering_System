import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// FETCH HOME DATA (with default restaurant)
export const fetchHomeData = (restaurantId = 1) => {
  return API.get(`home/?restaurant=${restaurantId}`);
};

// FETCH TRENDING ITEMS
export const fetchTrendingData = () => {
  return API.get("trending/");
};

// ✅ FETCH MENU BY CATEGORY
export const fetchMenuByCategory = (categoryId, restaurantId = 1) => {
  return API.get(`menu/filter/?category_id=${categoryId}&restaurant=${restaurantId}`);
};

// FETCH ALL ACTIVE TABLES (with QR code URLs)
export const fetchTables = () => {
  return API.get("tables/");
};

// PLACE ORDER
export const placeOrder = (data) => {
  return API.post("orders/", data);
};

// CREATE PAYMENT
export const createPayment = (data) => {
  return API.post("create-payment/", data);
};

// VERIFY PAYMENT
export const verifyPayment = (data) => {
  return API.post("verify-payment/", data);
};



export default API;