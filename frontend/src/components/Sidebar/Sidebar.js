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
/*eslint-disable*/
import { useState } from "react";
import { NavLink as NavLinkRRD, Link, useNavigate } from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

var ps;

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  const navigate = useNavigate();

  // toggles collapse between opened and closed (true/false)
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };

  // closes the collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  // handle logout
  const HandleLogout = () => {
    // Add your logout logic here (clear tokens, session, etc.)
    // For example:
    localStorage.removeItem('authToken');
    // Redirect to login page
    navigate('/auth/login');
    closeCollapse();
  };

  const { logo } = props;
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
  const handleLogout = (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du NavLink
    navigate('/auth/logout'); // Utilise la route de logout qui gère la déconnexion
    closeCollapse();
  };


  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Brand */}
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}

        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>

          {/* Navigation */}
          <Nav navbar>
            {/* Dashboard Section */}
            <h6 className="navbar-heading text-muted">Main Menu</h6>
            <NavItem>
              <NavLink
                to="/admin/dashboard"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
                <i className="ni ni-tv-2 text-primary" />
                Dashboard
              </NavLink>
            </NavItem>

            {/* Client Management */}
            <NavItem>
              <NavLink
                to="/admin/Clients"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
                <i className="ni ni-single-02 text-yellow" />
                Clients
              </NavLink>
            </NavItem>

            {/* Domain Management */}
            <h6 className="navbar-heading text-muted mt-3">Domain Services</h6>
            <NavItem>
            <NavLink
                to="/admin/domains"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
                <i className="ni ni-planet text-blue" />
                Domain Names
              </NavLink>
            </NavItem>

            {/* History Section */}
            <NavItem>
              <NavLink
                to="/admin/historyDomains"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
                <i className="ni ni-bullet-list-67 text-red" />
                History Domain
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                to="/admin/historyTechnology"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
              <i className="fas fa-history " />
                History Technology
              </NavLink>
            </NavItem>

            {/* User Section */}
            <h6 className="navbar-heading text-muted mt-3">Administration</h6>
            <NavItem>
              <NavLink
                to="/admin/users"
                tag={NavLinkRRD}
                onClick={closeCollapse}
                activeClassName="active"
              >
                <i className="ni ni-single-02 text-purple" />
                User Management
              </NavLink>
            </NavItem>

            {/* Logout Section */}
            <h6 className="navbar-heading text-muted mt-3">Account</h6>
            <NavItem>
              <NavLink
                to="#"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <i className="ni ni-user-run text-danger" />
                Logout
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;