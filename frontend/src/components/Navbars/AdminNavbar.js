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
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = (props) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [collapseOpen, setCollapseOpen] = useState(false);
  const navigate = useNavigate();
  const { logo, brandText } = props;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = localStorage.getItem('UserId');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          console.warn("User ID or token not found in localStorage");
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const toggleCollapse = () => {
    setCollapseOpen(prevState => !prevState);
  };

  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    // Clear all auth-related items
    localStorage.removeItem('token');
    localStorage.removeItem('RoleUser');
    localStorage.removeItem('UserId');
    navigate('/auth/login');
    closeCollapse();
  };

  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {brandText}
          </Link>

          
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;