import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import * as yup from "yup";
import Papa from "papaparse";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'devicon/devicon.min.css';

// reactstrap components
import {
  Badge,
  Card,
  CardBody,
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
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Col,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";
import classnames from "classnames";

// core components
import Header from "components/Headers/Header.js";

const DomainName = () => {
  const API_BASE_URL = "http://127.0.0.1:8000/api";
  const { userRole } = useContext(AppContext);
  const navigate = useNavigate();

  // State management
  const [domaines, setDomaines] = useState([]);
  const [domainClient, setDomainClient] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [certificatSSL, setCertificatSSL] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Form states
  const [formData, setFormData] = useState({
    nom_domaine: '',
    date_expiration: '',
    statut: 'actif',
    client_id: '',
  });
  const [errors, setErrors] = useState({});
  
  // UI states
  const [showForm, setShowForm] = useState(false);
  const [showCSVForm, setShowCSVForm] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [domaineCsv, setDomainCsv] = useState([]);
  const [selectedDomaine, setSelectedDomaine] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [activeModalTab, setActiveModalTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Validation schema
  const schema = yup.object().shape({
    nom_domaine: yup
      .string()
      .required("Le nom de domaine est requis")
      .matches(
        /^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/,
        "Doit être un domaine valide (ex: example.com)"
      ),
    statut: yup.string().required("Le statut est requis"),
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [domainesRes, clientsRes, techRes, sslRes] = await Promise.all([
        fetch(`${API_BASE_URL}/domaines`),
        fetch(`${API_BASE_URL}/clients`),
        fetch(`${API_BASE_URL}/technologies`),
        fetch(`${API_BASE_URL}/certificatSsl`)
      ]);

      const [domainesData, clientsData, techData, sslData] = await Promise.all([
        domainesRes.json(),
        clientsRes.json(),
        techRes.json(),
        sslRes.json()
      ]);

      setDomaines(domainesData.domaines);
      setFilteredDomaines(domainesData.domaines);
      setDomainClient(clientsData.clients || []);
      setTechnologies(techData.technologies || []);
      setCertificatSSL(sslData.certificatsSsl || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Redirect non-admin users
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = domaines.filter(
      (domaine) =>
        domaine.nom_domaine.toLowerCase().includes(term) ||
        (domaine.client_id && domaine.client_id.toString().includes(term)) ||
        domaine.statut.toLowerCase().includes(term)
    );
    setFilteredDomaines(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 
    try {
      await schema.validate(formData, { abortEarly: false });

      const response = await fetch(`${API_BASE_URL}/domaines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "Domain added successfully");
        resetForm();
        await fetchData();
      } else {
        if (response.status === 422) {
          setErrors(result.errors || {});
        } else {
          throw new Error(result.message || "Failed to add domain");
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
        console.error("Error submitting form:", error);
        toast.error(error.message || "An error occurred while submitting the form");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await schema.validate(formData, { abortEarly: false });
      
      const response = await fetch(`${API_BASE_URL}/domaines/${selectedDomaine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Domain updated successfully");
        setEditModalOpen(false);
        await fetchData();
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
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom_domaine: '',
      date_expiration: '',
      statut: 'actif',
      client_id: '',
      date_expirationSsl: ''
    });
    setErrors({});
    setShowForm(false);
  };

  // Domain actions
  const openEditModal = (domaine) => {
    setFormData({
      nom_domaine: domaine.nom_domaine,
      date_expiration: domaine.date_expiration,
      statut: domaine.statut,
      client_id: domaine.client_id,
      date_expirationSsl: domaine.date_expirationSsl || ""
    });
    setSelectedDomaine(domaine);
    setEditModalOpen(true);
  };

  const handleViewDomaine = (domaine) => {
    setSelectedDomaine(domaine);
    setIsModalOpen(true);
  };

  const handleDelete = async (domaineId) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/domaines/${domaineId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        toast.success("Domain deleted successfully");
        await fetchData();
        // Adjust current page if last item on page was deleted
        if (filteredDomaines.length % itemsPerPage === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        throw new Error("Failed to delete domain");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  // CSV handling
  const handleDataCsv = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data?.length > 0) {
            const domaines = results.data
              .filter(row => row.nom_domaine)
              .map(row => ({
                nom_domaine: row.nom_domaine.trim(),
                date_expiration: row.date_expiration || "",
                client_id: row.client_id || "",
                date_expirationSsl: row.date_expirationSsl || ""
              }));
            
            setCsvData(domaines);
            setDomainCsv(domaines);
          } else {
            toast.warning("CSV file is empty or malformed");
          }
        },
        error: (error) => {
          toast.error("Error reading CSV file");
          console.error("CSV error:", error);
        },
      });
    }
  };

  const handleSubmitDataCsv = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/domaines/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(domaineCsv),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "Domains imported successfully");
        setShowCSVForm(false);
        await fetchData();
      } else {
        throw new Error(result.message || "Failed to import domains");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getClientNameById = (clientId) => {
    const client = domainClient.find(c => c.id == clientId);
    return client ? client.nom_entreprise : "Unknown client";
  };

  const getTechnologiesForDomain = (domainId) => {
    return technologies.filter(tech => tech.domaine_id == domainId);
  };

  const getCertificatForDomaine = (domainId) => {
    return certificatSSL.find(cert => cert.domaine_id == domainId);
  }; 

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleModalTab = (tab) => {
    if (activeModalTab !== tab) setActiveModalTab(tab);
  };

  // Pagination functions
  const paginate = (items, pageNumber, pageSize) => {
    const startIndex = (pageNumber - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const currentItems = paginate(filteredDomaines, currentPage, itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDomaines.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Expiration functions
  function isExpiringSoon(expirationDate, monthsThreshold) {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setMonth(now.getMonth() + monthsThreshold);
    
    return expDate > now && expDate <= thresholdDate;
  }
  
  function isExpiredOrCurrentMonth(expirationDate) {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    
    return expDate <= now || 
           (expDate.getMonth() === now.getMonth() && 
            expDate.getFullYear() === now.getFullYear());
  }

  const runDetectTechnologies = async () => {
    alert('Detection des Technologies Des Tous Domaines.')
    try {
      const response = await fetch('http://localhost:8000/api/run-detect-technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
      console.log('Commande lancée :', result.message);
      console.log('Sortie artisan :', result.output);
    } catch (error) {
      console.error('Erreur lors de l exécution de la commande :', error);
    }
  };

  const runDetectForDomain = async (domainId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/run-detect-technologies/${domainId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
  
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur inconnue');
      }
      
      console.log('Commande lancée :', result.message);
      console.log('Sortie artisan :', result.output);
      
      alert(result.message);
      
    } catch (error) {
      console.error('Erreur lors de lexécution de la commande :', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const runDetectStatusDomain = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/run-detect-statusDomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
      console.log('Commande lancée :', result.message);
      console.log('Sortie artisan :', result.output);
  
      alert('Detection completed successfully! Refreshing data...');
      
      setTimeout(() => {
        window.location.reload();
      }, 800);
  
    } catch (error) {
      console.error('Erreur lors de l exécution de la commande :', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading && !domaines.length) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading domains...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Domains Management</h3>
                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                  <InputGroup className="w-auto">
                    <Input
                      placeholder="Search domains..."
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
                  <Button onClick={() => { setShowForm(!showForm); setShowCSVForm(false); }} color="primary">
                    <i className="fas fa-plus mr-2" /> Add Domain
                  </Button>
                  <Button onClick={() => { setShowCSVForm(!showCSVForm); setShowForm(false); }} color="primary">
                    <i className="fas fa-file-csv mr-2" /> Import CSV
                  </Button>
                 
                  <UncontrolledDropdown>
                    <DropdownToggle caret color="secondary">
                      Detection
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={runDetectTechnologies}><i className="fas fa-history text-purple mr-2" />Technology</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={runDetectStatusDomain}><i className="fas fa-fingerprint text-red mr-2" />Status Domains
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </CardHeader>

              {/* Add Domain Form */}
              {showForm && (
                <div className="px-4 py-3">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label>Domain Name*</Label>
                          <Input
                            name="nom_domaine"
                            value={formData.nom_domaine}
                            onChange={handleInputChange}
                            invalid={!!errors.nom_domaine}
                            placeholder="example.com"
                          />
                          {errors.nom_domaine && <small className="text-danger">{errors.nom_domaine}</small>}
                        </FormGroup>
                        
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>Client</Label>
                          <Input
                            type="select"
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Client</option>
                            {domainClient.map((client) => (
                              <option key={client.id} value={client.id}>{client.nom_entreprise}</option>
                            ))}
                          </Input>
                        </FormGroup>
                        
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between">
                      <Button color="secondary" onClick={resetForm}>Cancel</Button>
                      <Button type="submit" color="primary"> {isSubmitting ? (
    <>
      <Spinner size="sm" className="mr-2" /> Saving...
    </>
  ) : (
    'Save Domain'
  )}</Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* Formulaire CSV */}
              {showCSVForm && (
                <div className="csv-form formClient container ">
                  <h3>Import CSV File</h3>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleDataCsv}
                    className="file-input mb-3"
                  />
                  {csvData.length > 0 && (
                    <div className="imported-domains">
                      <h4>Imported Domains:</h4>
                      <form onSubmit={handleSubmitDataCsv}>
                        {csvData.map((domain, index) => (
                          <div key={index} className="domain-row mb-4 p-3 text-center border rounded">
                            <div className="mb-2">
                              <label className="font-weight-bold">{domain.nom_domaine}</label>
                            </div>
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                              <div className="mb-2 flex-grow-1 me-2">
                                <label>Select Client :  </label>
                                <select
                                  name="client_id"
                                  onChange={(e) => {
                                    setDomainCsv((prev) => {
                                      const newDomain = [...prev];
                                      newDomain[index] = {
                                        ...newDomain[index],
                                        client_id: e.target.value,
                                      };
                                      return newDomain;
                                    });
                                  }}
                                  className="w-full px-2 py-1 col-4 border rounded"
                                >
                                  <option value="">Choose a Client</option>
                                  {domainClient.map((client) => (
                                    <option key={client.id} value={client.id}>
                                      {client.nom_entreprise}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button type="submit" className="mb-3" color="primary">{isSubmitting ? (
    <>
      <Spinner size="sm" className="mr-2" /> Saving...
    </>
  ) : (
    'Save Domains'
  )}</Button>
                      </form>
                    </div>
                  )}
                </div>
              )}              
              {/* Domains Table */}
              <Table className="align-items-center table-flush text-center" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Domain</th>
                    <th scope="col">Client</th>
                    <th scope="col">Expiration</th>
                    <th scope="col">Status</th>
                    <th scope="col">SSL Status</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((domaine) => {
                    const sslCert = getCertificatForDomaine(domaine.id);
                    return (
                      <tr key={domaine.id}>
                        <td>
                          <a 
                            href={`http://${domaine.nom_domaine}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-weight-bold"
                          >
                            {domaine.nom_domaine}
                          </a>
                        </td>
                        <td>{getClientNameById(domaine.client_id)}</td>
                        <td>{domaine.date_expiration || '-'}</td>
                        <td>
                          <Badge color={domaine.statut === 'actif' ? 'success' : 'danger'} pill>
                            {domaine.statut}
                          </Badge>
                        </td>
                        <td>
                          {sslCert ? (
                            <Badge 
                              color={
                                isExpiredOrCurrentMonth(sslCert.date_expiration) ? 'danger' :
                                sslCert.statut === 'valide' && isExpiringSoon(sslCert.date_expiration, 3) ? 'success' :
                                sslCert.statut === 'valide' ? 'primary' :
                                'warning'
                              } 
                              pill
                            >
                              {sslCert.date_expiration}
                            </Badge>
                          ) : (
                            <Badge color="secondary" pill>Aucun</Badge>
                          )}
                        </td>
                        <td className="text-right">
                          <UncontrolledDropdown>
                            <DropdownToggle
                              className="btn-icon-only text-light"
                              size="sm"
                              color=""
                            >
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem onClick={() => handleViewDomaine(domaine)}>
                                <i className="fas fa-eye mr-2"></i> View
                              </DropdownItem>
                              <DropdownItem onClick={() => openEditModal(domaine)}>
                                <i className="fas fa-edit mr-2"></i> Edit
                              </DropdownItem>
                              <DropdownItem onClick={() => runDetectForDomain(domaine.id)}>
                                <i className="fas fa-search mr-2"></i> Detect Technology
                              </DropdownItem>
                              <DropdownItem onClick={() => handleDelete(domaine.id)}>
                                <i className="fas fa-trash mr-2"></i> Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {filteredDomaines.length === 0 && (
                <CardBody className="text-center py-5">
                  <i className="fas fa-globe fa-3x text-muted mb-3" />
                  <h4>No domains found</h4>
                  {searchTerm && (
                    <Button color="primary" onClick={() => setSearchTerm("")} className="mt-3">
                      Clear search
                    </Button>
                  )}
                </CardBody>
              )}

              <CardFooter className="py-4">
                <nav aria-label="Domains pagination">
                  <Pagination className="justify-content-end mb-0">
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink previous tag="button" onClick={handlePrevPage}>
                        <i className="fas fa-angle-left" />
                      </PaginationLink>
                    </PaginationItem>
                    {pageNumbers.map(number => (
                      <PaginationItem key={number} active={number === currentPage}>
                        <PaginationLink tag="button" onClick={() => handlePageChange(number)}>
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === pageNumbers.length}>
                      <PaginationLink next tag="button" onClick={handleNextPage}>
                        <i className="fas fa-angle-right" />
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>

      {/* Domain Details Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg" style={{
        maxWidth: "800px",
        width: "90%",
      }}
      contentClassName="min-vh-75">
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Domain Details: {selectedDomaine?.nom_domaine}
        </ModalHeader>
        <ModalBody>
          {selectedDomaine && (
            <>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeModalTab === 'details' })}
                    onClick={() => toggleModalTab('details')}
                  >
                    <i className="fas fa-info-circle mr-2" /> Details
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeModalTab === 'technologies' })}
                    onClick={() => toggleModalTab('technologies')}
                  >
                    <i className="fas fa-code mr-2" /> Technologies
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeModalTab === 'ssl' })}
                    onClick={() => toggleModalTab('ssl')}
                  >
                    <i className="fas fa-lock mr-2" /> SSL Certificate
                  </NavLink>
                </NavItem>
              </Nav>
              
              <TabContent activeTab={activeModalTab} className="pt-4">
                <TabPane tabId="details">
                  <Row>
                    <Col md="6">
                      <div className="detail-item">
                        <h6 className="detail-label">Domain Name</h6>
                        <p className="detail-value">{selectedDomaine.nom_domaine}</p>
                      </div>
                      <div className="detail-item">
                        <h6 className="detail-label">Client</h6>
                        <p className="detail-value">{getClientNameById(selectedDomaine.client_id)}</p>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="detail-item">
                        <h6 className="detail-label">Expiration Date</h6>
                        <p className="detail-value">{selectedDomaine.date_expiration || '-'}</p>
                      </div>
                      <div className="detail-item">
                        <h6 className="detail-label">Status</h6>
                        <p className="detail-value">
                          <Badge color={selectedDomaine.statut === 'actif' ? 'success' : 'danger'} pill>
                            {selectedDomaine.statut}
                          </Badge>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </TabPane>
                
                <TabPane tabId="technologies">
                  {getTechnologiesForDomain(selectedDomaine.id).length > 0 ? (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Technology</th>
                          <th>Version</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTechnologiesForDomain(selectedDomaine.id).map((tech) => {
                          const getTechIconClass = (techName) => {
                            const techMap = {
                              'html': 'devicon-html5-plain',
                              'css': 'devicon-css3-plain',
                              'javascript': 'devicon-javascript-plain',
                              'typescript': 'devicon-typescript-plain',
                              'vue.js': 'devicon-vuejs-plain',
                              'react': 'devicon-react-original',
                              'angular': 'devicon-angularjs-plain',
                              'svelte': 'devicon-svelte-plain',
                              'node': 'devicon-nodejs-plain',
                              'express': 'devicon-express-original',
                              'nestjs': 'devicon-nestjs-plain',
                              'python': 'devicon-python-plain',
                              'java': 'devicon-java-plain',
                              'c': 'devicon-c-plain',
                              'c++': 'devicon-cplusplus-plain',
                              'c#': 'devicon-csharp-plain',
                              'go': 'devicon-go-plain',
                              'rust': 'devicon-rust-plain',
                              'php': 'devicon-php-plain',
                              'ruby': 'devicon-ruby-plain',
                            };

                            const normalizedName = techName
                              .toLowerCase()
                              .replace(/\s+/g, '')
                              .replace(/#/g, 'sharp')
                              .replace(/\+/g, 'plus');

                            return techMap[normalizedName] || `devicon-${normalizedName}-plain`;
                          };

                          const techIconClass = getTechIconClass(tech.nom_technologie);

                          return (
                            <tr key={tech.id}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <i className={`${techIconClass} colored`} style={{ fontSize: "1.5rem" }}></i>
                                  {tech.nom_technologie}
                                </div>
                              </td>
                              <td>{tech.version}</td>
                              <td>
                                <Badge color={tech.statut === 'actif' ? 'success' : 'danger'} pill>
                                  {tech.statut}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-code fa-3x text-muted mb-3" />
                      <h5>No technologies associated</h5>
                    </div>
                  )}
                </TabPane>
                
                <TabPane tabId="ssl">
                  {getCertificatForDomaine(selectedDomaine.id) ? (
                    <Row>
                      <Col md="6">
                        <div className="detail-item">
                          <h6 className="detail-label">SSL Status</h6>
                          <p className="detail-value">
                            <Badge color={getCertificatForDomaine(selectedDomaine.id).statut === 'valide' ? 'success' : 'warning'} pill>
                              {getCertificatForDomaine(selectedDomaine.id).statut}
                            </Badge>
                          </p>
                        </div>
                      </Col>
                      <Col md="6">
                        <div className="detail-item">
                          <h6 className="detail-label">SSL Expiration</h6>
                          <p className="detail-value">
                            {getCertificatForDomaine(selectedDomaine.id).date_expiration || '-'}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-lock fa-3x text-muted mb-3" />
                      <h5>No SSL certificate associated</h5>
                    </div>
                  )}
                </TabPane>
              </TabContent>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
          {selectedDomaine && (
            <Button color="primary" onClick={() => {
              setIsModalOpen(false);
              openEditModal(selectedDomaine);
            }}>
              Edit Domain
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Edit Domain Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)} size="lg" style={{ maxWidth: '800px' }} >
        <ModalHeader toggle={() => setEditModalOpen(false)}>
          Edit Domain: {selectedDomaine?.nom_domaine}
        </ModalHeader>
        <ModalBody>
          {selectedDomaine && (
            <Form onSubmit={handleUpdateDomain}>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label>Domain Name*</Label>
                    <Input
                      name="nom_domaine"
                      value={formData.nom_domaine}
                      onChange={handleInputChange}
                      invalid={!!errors.nom_domaine}
                    />
                    {errors.nom_domaine && <small className="text-danger">{errors.nom_domaine}</small>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Expiration Date*</Label>
                    <Input
                      type="date"
                      name="date_expiration"
                      value={formData.date_expiration}
                      onChange={handleInputChange}
                      invalid={!!errors.date_expiration}
                    />
                    {errors.date_expiration && <small className="text-danger">{errors.date_expiration}</small>}
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label>Status*</Label>
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
                  <FormGroup>
                    <Label>SSL Expiration</Label>
                    <Input
                      type="date"
                      name="date_expirationSsl"
                      value={formData.date_expirationSsl}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <div className="d-flex justify-content-between">
                <Button color="secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default DomainName;