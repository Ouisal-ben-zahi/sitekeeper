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

// Configuration de l'API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const ClientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("informations");
    const [editMode, setEditMode] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [domains, setDomains] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nom_entreprise: '',
        ice: '',
        ville: '',
        code_postal: '',
        nom_responsable: '',
        tel_responsable: '',
        email_responsable: '',
        adresse: ''
    });

    // Fonction pour charger les données
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [clientResponse, domainsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/clients/${id}`),
                fetch(`${API_BASE_URL}/domaines?client_id=${id}`)
            ]);

            if (!clientResponse.ok) throw new Error('Failed to fetch client');
            if (!domainsResponse.ok) throw new Error('Failed to fetch domains');

            const [client, domains] = await Promise.all([
                clientResponse.json(),
                domainsResponse.json()
            ]);

            setClientData(client.client);
            setDomains(domains.domaines);

            // Initialisation des données du formulaire
            setFormData({
                nom_entreprise: client.client.nom_entreprise,
                ice: client.client.ice,
                ville: client.client.ville,
                code_postal: client.client.code_postal,
                nom_responsable: client.client.nom_responsable,
                tel_responsable: client.client.tel_responsable,
                email_responsable: client.client.email_responsable,
                adresse: client.client.adresse || ''
            });

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message);
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

        if (!formData.nom_entreprise.trim()) newErrors.nom_entreprise = "Company name is required";
        if (!formData.ice.trim() || formData.ice.length !== 15) newErrors.ice = "ICE must be 15 digits";
        if (!formData.ville.trim()) newErrors.ville = "City is required";
        if (!formData.code_postal.trim()) newErrors.code_postal = "Postal code is required";
        if (!formData.nom_responsable.trim()) newErrors.nom_responsable = "Manager name is required";
        if (!formData.tel_responsable.trim() || formData.tel_responsable.length !== 10) newErrors.tel_responsable = "Phone must be 10 digits";
        if (!formData.email_responsable.trim() || !/^\S+@\S+\.\S+$/.test(formData.email_responsable)) newErrors.email_responsable = "Valid email is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(data.errors || {});
                    throw new Error("Validation error");
                }
                throw new Error(data.message || "Failed to update client");
            }

            // Mise à jour des données locales
            setClientData(data.client);
            setEditMode(false);
            toast.success("Client updated successfully!");

        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.message || "An error occurred while updating the client");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        // Réinitialiser les données du formulaire avec les données originales
        if (clientData) {
            setFormData({
                nom_entreprise: clientData.nom_entreprise,
                ice: clientData.ice,
                ville: clientData.ville,
                code_postal: clientData.code_postal,
                nom_responsable: clientData.nom_responsable,
                tel_responsable: clientData.tel_responsable,
                email_responsable: clientData.email_responsable,
                adresse: clientData.adresse || ''
            });
        }
        setErrors({});
        setEditMode(false);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading client data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="order-xl-1" xl="12">
                        <Alert color="danger">
                            <h3>Error loading client data</h3>
                            <p>{error}</p>
                            <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                                Back to Clients List
                            </Button>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!clientData) {
        return (
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="order-xl-1" xl="12">
                        <Alert color="warning">
                            <h3>Client not found</h3>
                            <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                                Back to Clients List
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
                                        <h3 className="mb-0">Client Profile</h3>
                                        <p className="text-muted mb-0">{clientData.nom_entreprise}</p>
                                    </Col>
                                    <Col className="text-right" xs="4">
                                        <Button
                                            color={editMode ? 'secondary' : 'primary'}
                                            onClick={editMode ? handleCancelEdit : () => setEditMode(true)}
                                            size="sm"
                                            disabled={isSubmitting}
                                        >
                                            {editMode ? (
                                                <>
                                                    <i className="fas fa-times mr-1" /> Cancel
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-edit mr-1" /> Edit
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Nav tabs>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === 'informations' })}
                                            onClick={() => toggleTab('informations')}
                                        >
                                            <i className="fas fa-info-circle mr-1" /> Information
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === 'domains' })}
                                            onClick={() => toggleTab('domains')}
                                        >
                                            <i className="fas fa-globe mr-1" /> Domains
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={activeTab}>
                                    <TabPane tabId="informations">
                                        <Form onSubmit={handleSubmit}>
                                            {editMode ? (
                                                <>
                                                    <h6 className="heading-small text-muted mb-4">Company Information</h6>
                                                    <div className="pl-lg-4">
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="nom_entreprise">Company Name*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="nom_entreprise"
                                                                        name="nom_entreprise"
                                                                        value={formData.nom_entreprise}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.nom_entreprise}
                                                                        required
                                                                    />
                                                                    {errors.nom_entreprise && (
                                                                        <div className="invalid-feedback d-block">{errors.nom_entreprise}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="ice">ICE* (15 digits)</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="ice"
                                                                        name="ice"
                                                                        value={formData.ice}
                                                                        onChange={handleInputChange}
                                                                        maxLength={15}
                                                                        invalid={!!errors.ice}
                                                                        required
                                                                    />
                                                                    {errors.ice && (
                                                                        <div className="invalid-feedback d-block">{errors.ice}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="ville">City*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="ville"
                                                                        name="ville"
                                                                        value={formData.ville}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.ville}
                                                                        required
                                                                    />
                                                                    {errors.ville && (
                                                                        <div className="invalid-feedback d-block">{errors.ville}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="code_postal">Postal Code*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="code_postal"
                                                                        name="code_postal"
                                                                        value={formData.code_postal}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.code_postal}
                                                                        required
                                                                    />
                                                                    {errors.code_postal && (
                                                                        <div className="invalid-feedback d-block">{errors.code_postal}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col lg="12">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="adresse">Address</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="adresse"
                                                                        name="adresse"
                                                                        value={formData.adresse}
                                                                        onChange={handleInputChange}
                                                                        type="textarea"
                                                                        rows="2"
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <hr className="my-4" />
                                                        <h6 className="heading-small text-muted mb-4">Contact Information</h6>
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="nom_responsable">Manager Name*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="nom_responsable"
                                                                        name="nom_responsable"
                                                                        value={formData.nom_responsable}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.nom_responsable}
                                                                        required
                                                                    />
                                                                    {errors.nom_responsable && (
                                                                        <div className="invalid-feedback d-block">{errors.nom_responsable}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="tel_responsable">Phone*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="tel_responsable"
                                                                        name="tel_responsable"
                                                                        value={formData.tel_responsable}
                                                                        onChange={handleInputChange}
                                                                        maxLength={10}
                                                                        invalid={!!errors.tel_responsable}
                                                                        required
                                                                    />
                                                                    {errors.tel_responsable && (
                                                                        <div className="invalid-feedback d-block">{errors.tel_responsable}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col lg="6">
                                                                <FormGroup>
                                                                    <label className="form-control-label" htmlFor="email_responsable">Email*</label>
                                                                    <Input
                                                                        className="form-control-alternative"
                                                                        id="email_responsable"
                                                                        name="email_responsable"
                                                                        type="email"
                                                                        value={formData.email_responsable}
                                                                        onChange={handleInputChange}
                                                                        invalid={!!errors.email_responsable}
                                                                        required
                                                                    />
                                                                    {errors.email_responsable && (
                                                                        <div className="invalid-feedback d-block">{errors.email_responsable}</div>
                                                                    )}
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
                                                                <h6 className="heading-small text-muted mb-4">Company Information</h6>
                                                                <div className="client-info-grid">
                                                                    <div className="info-label">Company Name:</div>
                                                                    <div className="info-value">{clientData.nom_entreprise}</div>

                                                                    <div className="info-label">ICE:</div>
                                                                    <div className="info-value">{clientData.ice}</div>

                                                                    <div className="info-label">City:</div>
                                                                    <div className="info-value">{clientData.ville}</div>

                                                                    <div className="info-label">Postal Code:</div>
                                                                    <div className="info-value">{clientData.code_postal}</div>

                                                                    {clientData.adresse && (
                                                                        <>
                                                                            <div className="info-label">Address:</div>
                                                                            <div className="info-value">{clientData.adresse}</div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                            <Col md="6">
                                                                <h6 className="heading-small text-muted mb-4">Contact Information</h6>
                                                                <div className="client-info-grid">
                                                                    <div className="info-label">Manager:</div>
                                                                    <div className="info-value">{clientData.nom_responsable}</div>

                                                                    <div className="info-label">Phone:</div>
                                                                    <div className="info-value">{clientData.tel_responsable}</div>

                                                                    <div className="info-label">Email:</div>
                                                                    <div className="info-value">
                                                                        <a href={`mailto:${clientData.email_responsable}`}>
                                                                            {clientData.email_responsable}
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </TabPane>
                                    <TabPane tabId="domains">
                                        <div className="pl-lg-4 pt-4">
                                            {domains.length > 0 ? (
                                                <div className="table-responsive">
                                                    <Table hover className="align-items-center table-flush">
                                                        <thead className="thead-light">
                                                            <tr>
                                                                <th scope="col">Domain Name</th>
                                                                <th scope="col">Expiration Date</th>
                                                                <th scope="col">Status</th>
                                                                <th scope="col">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {domains.filter((domain) => domain.client_id == id).map(domain => (
                                                                <tr key={domain.id}>
                                                                    <td>
                                                                        <a
                                                                            href={`http://${domain.nom_domaine}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            {domain.nom_domaine}
                                                                        </a>
                                                                    </td>
                                                                    <td>{domain.date_expiration || 'N/A'}</td>
                                                                    <td>
                                                                        <Badge color={domain.statut === 'actif' ? 'success' : 'warning'} pill>
                                                                            {domain.statut}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <td>
                                                                            <a
                                                                                href={`http://${domain.nom_domaine}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-info btn-sm"
                                                                            >
                                                                                <i className="fas fa-eye" />
                                                                            </a>
                                                                        </td>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <i className="fas fa-globe text-muted" style={{ fontSize: '3rem' }} />
                                                    <h4 className="text-muted mt-3">No domains associated</h4>
                                                    <Button
                                                        color="primary"
                                                        className="mt-3"
                                                        onClick={() => {/* Ajouter une action pour ajouter un domaine */ }}
                                                    >
                                                        <i className="fas fa-plus mr-2" /> Add Domain
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
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

export default ClientProfile;