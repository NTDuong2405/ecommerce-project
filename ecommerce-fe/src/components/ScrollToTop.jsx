import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top gently or instantly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Usually instant is better for navigation to avoid weird jumping
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
