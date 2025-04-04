/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import LogoutToLogin from "views/examples/logout";
import Clients from "views/examples/Clients";
import ClientProfile from "views/examples/ClientProfile";
import DomainDetails from "views/examples/domainDetails";
import Users from "views/examples/Users";
import DomainName from "views/examples/DomainName";
import UserProfile from "views/examples/UserDetails";
import History from "views/examples/history";
import HistoryTechnology from "views/examples/HistoryTechnology";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
 
  {
    path: "/Clients",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Clients/>,
    layout: "/admin",

  },
  {
    path: "/users",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Users/>,
    layout: "/admin",

  },
  {
    path: "/users/:id",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <UserProfile/>,
    layout: "/admin",

  },
  {
    path: "/domains",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <DomainName/>,
    layout: "/admin",

  },
  {
    path: "/domains/:id",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <DomainName/>,
    layout: "/admin",

  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },

  {
    path: "/client-profile/:id",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <ClientProfile />,
    layout: "/admin",
  },
  {
    path: "/domain-details/:id",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <DomainDetails/>,
    layout: "/admin",
  },
  {
    path: "/historyDomains",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <History/>,
    layout: "/admin",

  },
  {
    path: "/historyTechnology",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <HistoryTechnology/>,
    layout: "/admin",

  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/logout",
    name: "Logout",
    icon: "ni ni-user-run text-danger",
    component: <LogoutToLogin />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
];
export default routes;
