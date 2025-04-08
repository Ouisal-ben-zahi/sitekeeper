import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    Container,
    Row,
    Col,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Spinner,
    Alert,
    Badge,
    Table
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import classnames from "classnames";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaInfoCircle, FaUserTag } from "react-icons/fa";
import { MdEmail, MdPhone, MdHome, MdDateRange, MdBusiness } from "react-icons/md";

// Configuration de l'API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("informations");
    const [editMode, setEditMode] = useState(true);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telephone: '',
        adresse: '',
        role: '',
        client_id: null,
        password: ''
    });

    // Fonction pour charger les données
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [userResponse, clientsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/users/${id}`),
                fetch(`${API_BASE_URL}/clients`)
            ]);

            if (!userResponse.ok) throw new Error('Failed to fetch user');
            if (!clientsResponse.ok) throw new Error('Failed to fetch clients');

            const [user, clients] = await Promise.all([
                userResponse.json(),
                clientsResponse.json()
            ]);

            setUserData(user.user);
            setClients(clients.clients);

            // Initialisation des données du formulaire
            setFormData({
                name: user.user.name,
                email: user.user.email,
                telephone: user.user.telephone,
                adresse: user.user.adresse,
                role: user.user.role,
                client_id: user.user.client_id || null,
                password: ''
            });

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message);
            toast.error("Failed to load user data");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleTab = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
        if (!formData.telephone.trim() || formData.telephone.length !== 10) newErrors.telephone = "Phone must be 10 digits";
        if (!formData.adresse.trim()) newErrors.adresse = "Address is required";
        if (!formData.role.trim()) newErrors.role = "Role is required";
        if (formData.role === 'client' && !formData.client_id) newErrors.client_id = "Client is required for client role";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    // Ne pas envoyer le mot de passe s'il est vide
                    password: formData.password || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(data.errors || {});
                    throw new Error("Validation error");
                }
                throw new Error(data.message || "Failed to update user");
            }

            // Mise à jour des données locales
            setUserData(data.user);
            setEditMode(true);
            toast.success("User updated successfully!");

        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.message || "An error occurred while updating the user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        // Réinitialiser les données du formulaire avec les données originales
        if (userData) {
            setFormData({
                name: userData.name,
                email: userData.email,
                telephone: userData.telephone,
                adresse: userData.adresse,
                role: userData.role,
                client_id: userData.client_id || null,
                password: ''
            });
        }
        setErrors({});
        setEditMode(true);
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case "admin": return "primary";
            case "technicien": return "info";
            case "client": return "success";
            default: return "secondary";
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="order-xl-1" xl="12">
                        <Alert color="danger">
                            <h3>Error loading user data</h3>
                            <p>{error}</p>
                            <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                                Back to Users List
                            </Button>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="order-xl-1" xl="12">
                        <Alert color="warning">
                            <h3>User not found</h3>
                            <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                                Back to Users List
                            </Button>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <>
            <UserHeader />
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="order-xl-1" xl="12">
                        <Card className="bg-secondary shadow">
                            <CardHeader className="bg-white border-0">
                                <Row className="align-items-center">
                                    <Col xs="8">
                                        <h3 className="mb-0">User Profile</h3>
                                        <p className="text-muted mb-0">
                                            <Badge color={getRoleBadge(userData.role)} className="mr-2">
                                                {userData.role}
                                            </Badge>
                                            {userData.name}
                                        </p>
                                    </Col>
                                    <Col className="text-right" xs="4">
                                        <Button
                                            color={editMode ? 'secondary' : 'primary'}
                                            onClick={editMode ? handleCancelEdit : () => setEditMode(true)}
                                            size="sm"
                                            disabled={isSubmitting}
                                        >
                                            
                                                <>
                                                    <FaEdit className="mr-1" /> Edit
                                                </>
                                      
                                        </Button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Nav tabs className="mb-4">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === 'informations' })}
                                            onClick={() => toggleTab('informations')}
                                        >
                                            <FaInfoCircle className="mr-1" /> Information
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                
                                <TabContent activeTab={activeTab}>
                                    <TabPane tabId="informations">
                                        <Form onSubmit={handleSubmit}>
                                            {editMode ? (
                                                <>
                                                    <h6 className="heading-small text-muted mb-4">User Information</h6>
                                                    <div className="pl-lg-4">
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="name">Name*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="name"
                                                                        name="name"
                                                                        value={formData.name}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.name}
                                                                        required
                                                                    />
                                                                    {errors.name && (
                                                                        <div className="invalid-feedback d-block">{errors.name}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="email">Email*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="email"
                                                                        name="email"
                                                                        type="email"
                                                                        value={formData.email}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.email}
                                                                        required
                                                                    />
                                                                    {errors.email && (
                                                                        <div className="invalid-feedback d-block">{errors.email}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="telephone">Phone*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="telephone"
                                                                        name="telephone"
                                                                        value={formData.telephone}
                                                                        onChange={handleInputChange}
                                                                        maxLength={10}
                                                                        invalid={!!errors.telephone}
                                                                        required
                                                                    />
                                                                    {errors.telephone && (
                                                                        <div className="invalid-feedback d-block">{errors.telephone}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="role">Role*</label>
                                                                    <Input
                                                                        type="select"
                                                                        className="form-control-alternative"
                                                                        id="role"
                                                                        name="role"
                                                                        value={formData.role}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.role}
                                                                        required
                                                                    >
                                                                        <option value="">Select Role</option>
                                                                        <option value="admin">Admin</option>
                                                                        <option value="technicien">Technician</option>
                                                                        <option value="client">Client</option>
                                                                    </Input>
                                                                    {errors.role && (
                                                                        <div className="invalid-feedback d-block">{errors.role}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        {formData.role === 'client' && (
                                                            <Row>
                                                                <Col lg="6">
                                                                    <FormGroup>
                                                                        <label className="form-control-label" htmlFor="client_id">Client*</label>
                                                                        <Input
                                                                            type="select"
                                                                            className="form-control-alternative"
                                                                            id="client_id"
                                                                            name="client_id"
                                                                            value={formData.client_id || ""}
                                                                            onChange={handleInputChange}
                                                                            invalid={!!errors.client_id}
                                                                            required
                                                                        >
                                                                            <option value="">Select Client</option>
                                                                            {clients.map(client => (
                                                                                <option key={client.id} value={client.id}>{client.nom_entreprise}</option>
                                                                            ))}
                                                                        </Input>
                                                                        {errors.client_id && (
                                                                            <div className="invalid-feedback d-block">{errors.client_id}</div>
                                                                        )}
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                        <Row>
                                                            <Col lg="12">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="adresse">Address*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="adresse"
                                                                        name="adresse"
                                                                        value={formData.adresse}
                                                                        onChange={handleInputChange}
                                                                        type="textarea"
                                                                        rows="2"
                                                                        invalid={!!errors.adresse}
                                                                        required
                                                                    />
                                                                    {errors.adresse && (
                                                                        <div className="invalid-feedback d-block">{errors.adresse}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="password">New Password</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="password"
                                                                        name="password"
                                                                        type="password"
                                                                        value={formData.password}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Leave blank to keep current password"
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <div className="text-right mt-4">
                                                            <Button
                                                                color="secondary"
                                                                onClick={handleCancelEdit}
                                                                className="mr-2"
                                                                disabled={isSubmitting}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                color="primary"
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                            >
                                                                {isSubmitting ? (
                                                                    <>
                                                                        <Spinner size="sm" className="mr-2" /> Saving...
                                                                    </>
                                                                ) : (
                                                                    'Save Changes'
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="pl-lg-4">
                                                        <Row>
                                                            <Col md="6">
                                                                <h6 className="heading-small text-muted mb-4">User Information</h6>
                                                                <div className="user-info-grid">
                                                                    <div className="info-label">
                                                                        <FaUserTag className="mr-2" /> Name:
                                                                    </div>
                                                                    <div className="info-value">{userData.name}</div>

                                                                    <div className="info-label">
                                                                        <MdEmail className="mr-2" /> Email:
                                                                    </div>
                                                                    <div className="info-value">
                                                                        <a href={`mailto:${userData.email}`}>
                                                                            {userData.email}
                                                                        </a>
                                                                    </div>

                                                                    <div className="info-label">
                                                                        <MdPhone className="mr-2" /> Phone:
                                                                    </div>
                                                                    <div className="info-value">{userData.telephone}</div>

                                                                    <div className="info-label">
                                                                        <FaUserTag className="mr-2" /> Role:
                                                                    </div>
                                                                    <div className="info-value">
                                                                        <Badge color={getRoleBadge(userData.role)}>
                                                                            {userData.role}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md="6">
                                                                <h6 className="heading-small text-muted mb-4">Additional Information</h6>
                                                                <div className="user-info-grid">
                                                                    {userData.client_id && (
                                                                        <>
                                                                            <div className="info-label">
                                                                                <MdBusiness className="mr-2" /> Client:
                                                                            </div>
                                                                            <div className="info-value">
                                                                                {clients.find(c => c.id === userData.client_id)?.nom_entreprise || 'N/A'}
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    <div className="info-label">
                                                                        <MdHome className="mr-2" /> Address:
                                                                    </div>
                                                                    <div className="info-value">{userData.adresse || 'N/A'}</div>

                                                                    <div className="info-label">
                                                                        <MdDateRange className="mr-2" /> Created At:
                                                                    </div>
                                                                    <div className="info-value">
                                                                        {new Date(userData.created_at).toLocaleDateString()}
                                                                    </div>

                                                                    <div className="info-label">
                                                                        <MdDateRange className="mr-2" /> Last Updated:
                                                                    </div>
                                                                    <div className="info-value">
                                                                        {new Date(userData.updated_at).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UserProfile;