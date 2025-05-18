import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import * as yup from "yup";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// reactstrap components
import {
  Badge,
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
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label
} from "reactstrap";
import classnames from "classnames";

// core components
import Header from "components/Headers/Header.js";

// Configuration de l'API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const DomainDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("details");
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technologies, setTechnologies] = useState([]);
  const [certificatSSL, setCertificatSSL] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    nom_domaine: '',
    date_expiration: '',
    statut: 'actif',
    client_id: '',
    date_expirationSsl: ''
  });

  // Fonction pour charger les données du domaine
  const fetchDomainData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [domainResponse, technologiesResponse, sslResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/domaines/${id}`),
        fetch(`${API_BASE_URL}/technologies?domaine_id=${id}`),
        fetch(`${API_BASE_URL}/certificatSsl?domaine_id=${id}`)
      ]);

      if (!domainResponse.ok) throw new Error('Failed to fetch domain');
      if (!technologiesResponse.ok) throw new Error('Failed to fetch technologies');
      if (!sslResponse.ok) throw new Error('Failed to fetch SSL certificate');

      const [domainData, techData, sslData] = await Promise.all([
        domainResponse.json(),
        technologiesResponse.json(),
        sslResponse.json()
      ]);

      setDomain(domainData.domaine);
      setTechnologies(techData.technologies);
      setCertificatSSL(sslData.certificatsSsl[0] || null);

      // Initialisation des données du formulaire
      setFormData({
        nom_domaine: domainData.domaine.nom_domaine,
        date_expiration: domainData.domaine.date_expiration,
        statut: domainData.domaine.statut,
        client_id: domainData.domaine.client_id,
        date_expirationSsl: domainData.domaine.date_expirationSsl || ''
      });

    } catch (err) {
      console.error("Error fetching domain data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDomainData();
  }, [fetchDomainData]);

  // Redirection si l'utilisateur n'est pas un admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Validation du formulaire avec Yup
  const schema = yup.object().shape({
    nom_domaine: yup.string().required("Le nom de domaine est requis")
      .matches(/^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/, "Le nom de domaine doit être valide (exemple : example.com)"),
    date_expiration: yup.date().required("La date d'expiration est requise"),
    statut: yup.string().required("Le statut est requis"),
  });

  // Mise à jour d'un domaine
  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await schema.validate(formData, { abortEarly: false });

      const response = await fetch(`${API_BASE_URL}/domaines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Domain updated successfully!");
        setDomain(data.domaine);
        setEditModalOpen(false);
      } else {
        if (response.status === 422) {
          setErrors(data.errors || {});
        } else {
          throw new Error(data.message || "Failed to update domain");
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
        console.error('Error updating domain:', error);
        toast.error(error.message || "An error occurred while updating the domain");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original domain data
    if (domain) {
      setFormData({
        nom_domaine: domain.nom_domaine,
        date_expiration: domain.date_expiration,
        statut: domain.statut,
        client_id: domain.client_id,
        date_expirationSsl: domain.date_expirationSsl || ''
      });
    }
    setErrors({});
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading domain data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="12">
            <Alert color="danger">
              <h3>Error loading domain data</h3>
              <p>{error}</p>
              <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                Back to Domains List
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!domain) {
    return (
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="12">
            <Alert color="warning">
              <h3>Domain not found</h3>
              <Button color="primary" onClick={() => navigate(-1)} className="mt-3">
                Back to Domains List
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="12">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Domain Details</h3>
                    <p className="text-muted mb-0">{domain.nom_domaine}</p>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      onClick={() => setEditModalOpen(true)}
                      size="sm"
                    >
                      <i className="fas fa-edit mr-1" /> Edit
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'details' })}
                      onClick={() => toggleTab('details')}
                    >
                      <i className="fas fa-info-circle mr-1" /> Details
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'technologies' })}
                      onClick={() => toggleTab('technologies')}
                    >
                      <i className="fas fa-code mr-1" /> Technologies
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="details">
                    <Form>
                      <h6 className="heading-small text-muted mb-4">Domain Information</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">Domain Name</label>
                              <div className="form-control-plaintext">
                                <a 
                                  href={`http://${domain.nom_domaine}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {domain.nom_domaine}
                                </a>
                              </div>
                            </div>
                          </Col>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">Status</label>
                              <div className="form-control-plaintext">
                                <Badge color={domain.statut === 'actif' ? 'success' : 'danger'} pill>
                                  {domain.statut}
                                </Badge>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">Expiration Date</label>
                              <div className="form-control-plaintext">
                                {domain.date_expiration || 'N/A'}
                              </div>
                            </div>
                          </Col>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">Client ID</label>
                              <div className="form-control-plaintext">
                                {domain.client_id || 'N/A'}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">SSL Certificate</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">SSL Expiration</label>
                              <div className="form-control-plaintext">
                                {certificatSSL?.date_expiration || 'N/A'}
                              </div>
                            </div>
                          </Col>
                          <Col lg="6">
                            <div className="form-group">
                              <label className="form-control-label">SSL Status</label>
                              <div className="form-control-plaintext">
                                {certificatSSL ? (
                                  <Badge color={certificatSSL.statut === 'valide' ? 'success' : 'danger'} pill>
                                    {certificatSSL.statut}
                                  </Badge>
                                ) : 'No SSL certificate'}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Form>
                  </TabPane>
                  <TabPane tabId="technologies">
                    <div className="pl-lg-4 pt-4">
                      {technologies.length > 0 ? (
                        <div className="table-responsive">
                          <Table hover className="align-items-center table-flush">
                            <thead className="thead-light">
                              <tr>
                                <th scope="col">Technology</th>
                                <th scope="col">Version</th>
                                <th scope="col">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {technologies.map((tech) => (
                                <tr key={tech.id}>
                                  <td>{tech.nom_technologie}</td>
                                  <td>{tech.version}</td>
                                  <td>
                                    <Badge color={tech.statut === 'actif' ? 'success' : 'danger'} pill>
                                      {tech.statut}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <i className="fas fa-code text-muted" style={{ fontSize: '3rem' }} />
                          <h4 className="text-muted mt-3">No technologies associated</h4>
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

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} toggle={handleCancelEdit} size="lg">
        <ModalHeader toggle={handleCancelEdit}>Edit Domain</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleUpdateDomain}>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Domain Name</Label>
                  <Input
                    type="text"
                    name="nom_domaine"
                    value={formData.nom_domaine}
                    onChange={handleInputChange}
                    invalid={!!errors.nom_domaine}
                  />
                  {errors.nom_domaine && (
                    <span className="text-danger small">{errors.nom_domaine}</span>
                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Status</Label>
                  <Input
                    type="select"
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                  >
                    <option value="actif">Active</option>
                    <option value="inactif">Inactive</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    name="date_expiration"
                    value={formData.date_expiration}
                    onChange={handleInputChange}
                    invalid={!!errors.date_expiration}
                  />
                  {errors.date_expiration && (
                    <span className="text-danger small">{errors.date_expiration}</span>
                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>SSL Expiration Date</Label>
                  <Input
                    type="date"
                    name="date_expirationSsl"
                    value={formData.date_expirationSsl}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelEdit} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            color="primary" 
            onClick={handleUpdateDomain}
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
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DomainDetails;