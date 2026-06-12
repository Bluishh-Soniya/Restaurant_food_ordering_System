import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — resets scroll to top on every route change.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Tell the browser NOT to auto-restore scroll position
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Temporarily disable smooth scrolling to force an INSTANT jump
    const html = document.documentElement;
    const body = document.body;
    const originalHtmlScroll = html.style.scrollBehavior;
    const originalBodyScroll = body.style.scrollBehavior;
    
    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    // Reset scroll immediately
    window.scrollTo(0, 0);

    // Reset again on next tick to handle any delayed layout shifts
    setTimeout(() => {
      window.scrollTo(0, 0);
      
      // Restore original smooth scrolling behavior
      html.style.scrollBehavior = originalHtmlScroll;
      body.style.scrollBehavior = originalBodyScroll;
    }, 10);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
