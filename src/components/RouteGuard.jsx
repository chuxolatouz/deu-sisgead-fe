import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function RouteGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    function authCheck(url) {
      // redirect to login page if accessing a private page and not logged in
      const publicPaths = [
        "/login",
        "/reset-password",
        "/404"
      ];
      const path = url.split("?")[0];
      const isPublicPath = publicPaths.includes(path);
      const token = window.localStorage.getItem("token")
      const isLoggedIn = typeof token === 'string' && token.trim().length > 0;
      const userData = window.localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const mustChangePassword = Boolean(user?.mustChangePassword);
      const returnUrl = router.query.returnUrl;
      
      if (path === "/") {
        router.push("/admin/products");
        return; // Exit the function early after redirect
      }

      if (!isLoggedIn && !isPublicPath) {
        router.push({
          pathname: "/login",
          query: { returnUrl: router.asPath }
        });
      } else if (isLoggedIn && mustChangePassword && path !== "/change-password") {
        router.push("/change-password");
      } else if (isLoggedIn && returnUrl) {
        router.push(returnUrl);
      } else {
        setAuthorized(true);
      }
    }
    // on initial load - run auth check
    authCheck(router.asPath);
    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return authorized && children;
}

export default RouteGuard;
