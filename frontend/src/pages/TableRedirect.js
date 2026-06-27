import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const TableRedirect = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { changeTable } = useCart();

  useEffect(() => {
    if (tableNumber) {
      changeTable(tableNumber);
    }
    navigate("/", { replace: true });
  }, [tableNumber, navigate, changeTable]);

  return null;
};

export default TableRedirect;
