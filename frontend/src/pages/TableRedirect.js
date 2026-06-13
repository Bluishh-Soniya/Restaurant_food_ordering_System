import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TableRedirect = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem("tableNumber", tableNumber);
    }
    navigate("/", { replace: true });
  }, [tableNumber, navigate]);

  return null;
};

export default TableRedirect;
