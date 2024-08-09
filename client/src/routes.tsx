/*
©2022 Pivotree | All rights reserved
*/

import { FaFileUpload } from "react-icons/fa";
import { Navigate, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { Home, Login } from "./routesJson";

let routes = [
  {
    path: "/login",
    id: "login",
    component: Login,
    isAllowed: true,
    route: PrivateRoute,
  },

  {
    path: "/home",
    label: "home",
    id: "home",
    component: Home,
    isAllowed: true,
    route: Route,
    icon: FaFileUpload,
  },

  {
    path: "/home",
    label: "home",
    id: "home",
    component: Home,
    isAllowed: true,
    route: Route,
  },

  {
    path: "/",
    label: "default",
    id: "default",
    component: () => <Navigate to="/home" />,
    isAllowed: true,
    route: Route,
  },
];

export { routes };
