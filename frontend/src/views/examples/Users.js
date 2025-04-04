import React, { useState, useEffect, useContext } from "react";
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { AppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const Users = () => {
  const { userRole } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [client_id, setClientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "",
    password: "",
    client_id: null
  });

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  // Fetch clients
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/clients")
      .then((response) => response.json())
      .then((data) => setClients(data.clients))
      .catch((error) => console.error("Error fetching clients:", error));
  }, []);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
        setFilteredUsers(data.users);
      })
      .catch((error) => console.error("Error fetching users:", error));
  };

  // Validation schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    telephone: yup.string().required("Phone is required").matches(/^\d{10}$/, "Phone must be 10 digits"),
    adresse: yup.string().required("Address is required"),
    role: yup.string().required("Role is required"),
    password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  });

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schema.validate(formData, { abortEarly: false });

      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("User added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        resetForm();
        fetchUsers();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert("Error adding user: " + result.message);
        }
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Form submission error:", error);
        alert("An error occurred during form submission.");
      }
    }
  };

  // Handle user deletion
  const handleDelete = async (userId, e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the user: " + error.message);
    }
  };

  // View user details
  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Edit user
  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setCurrentUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        telephone: userToEdit.telephone,
        adresse: userToEdit.adresse,
        role: userToEdit.role,
        password: "",
        client_id: userToEdit.client_id || null
      });
      setEditModalOpen(true);
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("User updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setEditModalOpen(false);
        fetchUsers();
      } else {
        alert("Error updating user: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred during update.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      telephone: "",
      adresse: "",
      role: "",
      password: "",
      client_id: null
    });
    setErrors({});
  };

  // Get badge color based on role
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin": return "primary";
      case "technicien": return "info";
      case "client": return "success";
      default: return "secondary";
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Users Management</h3>
                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                  <InputGroup className="w-auto">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{ minWidth: '250px' }}
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>
                        <i className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                  >
                    <FaPlus className="mr-2" /> Add New User
                  </button>
                </div>
              </CardHeader>

              {showForm && (
                <div className="px-4 py-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Name</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            invalid={!!errors.name}
                          />
                          {errors.name && <small className="text-danger">{errors.name}</small>}
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            invalid={!!errors.email}
                          />
                          {errors.email && <small className="text-danger">{errors.email}</small>}
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <Input
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            invalid={!!errors.telephone}
                          />
                          {errors.telephone && <small className="text-danger">{errors.telephone}</small>}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Address</label>
                          <Input
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            invalid={!!errors.adresse}
                          />
                          {errors.adresse && <small className="text-danger">{errors.adresse}</small>}
                        </div>
                        <div className="form-group">
                          <label>Role</label>
                          <Input
                            type="select"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            invalid={!!errors.role}
                          >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="technicien">Technician</option>
                            <option value="client">Client</option>
                          </Input>
                          {errors.role && <small className="text-danger">{errors.role}</small>}
                        </div>
                        {formData.role === 'client' && (
                          <div className="form-group">
                            <label>Client</label>
                            <Input
                              type="select"
                              name="client_id"
                              value={formData.client_id || ""}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Client</option>
                              {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.nom_entreprise}</option>
                              ))}
                            </Input>
                          </div>
                        )}
                        <div className="form-group">
                          <label>Password</label>
                          <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            invalid={!!errors.password}
                          />
                          {errors.password && <small className="text-danger">{errors.password}</small>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button type="submit" className="btn btn-primary">Add User</button>
                    </div>
                  </form>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success mx-4 mt-3">
                  {successMessage}
                </div>
              )}

              <Table className="align-items-center table-flush text-center" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Role</th>
                    <th scope="col">Client</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <th scope="row">
                        <Media className="align-items-center">
                          <Media>
                            <span className="mb-0 text-sm">
                              {user.name}
                            </span>
                          </Media>
                        </Media>
                      </th>
                      <td>{user.email}</td>
                      <td>{user.telephone}</td>
                      <td>
                        <Badge color={getRoleBadge(user.role)} className="badge-pill">
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        {user.client_id ? 
                          clients.find(c => c.id === user.client_id)?.nom_entreprise || 'N/A' : 
                          '---'}
                      </td>
                      <td className="text-right">
                        <UncontrolledDropdown>
                          <DropdownToggle
                            className="btn-icon-only text-light"
                            href="#pablo"
                            role="button"
                            size="sm"
                            color=""
                            onClick={(e) => e.preventDefault()}
                          >
                            <i className="fas fa-ellipsis-v" />
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-arrow" right>
                            <DropdownItem to={`/admin/users/${user.id}`}
                                                                                          tag={Link}>
                              <FaEye className="mr-2" /> View
                            </DropdownItem>
                           
                            <DropdownItem onClick={(e) => handleDelete(user.id, e)}>
                              <FaTrash className="mr-2" /> Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <nav aria-label="...">
                  <Pagination
                    className="pagination justify-content-end mb-0"
                    listClassName="justify-content-end mb-0"
                  >
                    <PaginationItem className="disabled">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        tabIndex="-1"
                      >
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className="active">
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        2 <span className="sr-only">(current)</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>

    </>
  );
};

export default Users;