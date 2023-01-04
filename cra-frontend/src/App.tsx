import React from "react";
import {
  Route,
  Routes
} from "react-router-dom";

import Counter from "./features/counter/Counter";
function App() {
  const routes = [
    { path: "/", element: <Counter />, protected: false },
    // { path: '/map', element: <MapPage />, protected: false },
    // { path: '/login', element: <Login />, protected: false },
    // { path: '/register', element: <Register />, protected: false },
    // { path: '/dashboard', element: <Dashboard />, protected: true },
    // { path: '/dashboardCompany', element: <DashboardCompany />, protected: false },
    // { path: '/information', element: <SalesPage />, protected: false },
    // { path: '/companyLogin', element: <CompanyLogin />, protected: false },
  ];

  // useEffect(() => {
  //   if(user?.accessToken) {
  //     setAxiosAuthToken(user.accessToken);
  //   }

  // }, [user]);

  // function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  //   const prevLocation = useLocation();

  //   if (!user) {
  //     return <Navigate to="/login" replace state={{ attemptedPath: prevLocation }} />;
  //   }
  //   return children;
  // }

  return (
    <div>
      <Routes>
        <Route path="*" element={<div>404 Not Found</div>} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected ? (
                // <ProtectedRoute>{route.element}</ProtectedRoute>
                <>{route.element}</>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Routes>
    </div>
  );
}

export default App;
