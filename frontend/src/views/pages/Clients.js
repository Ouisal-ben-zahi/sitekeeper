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
// reactstrap components
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
} from "reactstrap";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const Clients = () => {
    const { userRole } = useContext(AppContext);
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [nomEntreprise, setNomEntreprise] = useState("");
    const [ice, setIce] = useState("");
    const [ville, setVille] = useState("");
    const [codePostal, setCodePostal] = useState("");
    const [nomResponsable, setNomResponsable] = useState("");
    const [telResponsable, setTelResponsable] = useState("");
    const [emailResponsable, setEmailResponsable] = useState("");
    const [adresse, setAdresse] = useState("");
    const [password, setPassword] = useState("");
    const [selectIdClient, setSelectIdClient] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [domaines, setDomaines] = useState([]);
    const [filteredDomainsClientId, setFilteredDomainsClientId] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

     // Pagination states
      const [currentPage, setCurrentPage] = useState(1);
      const [itemsPerPage] = useState(10);

    // Récupérer les clients
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/clients")
            .then((response) => response.json())
            .then((data) => {
                setClients(data.clients);
                setFilteredClients(data.clients);
            })
            .catch((error) => console.error("Erreur lors de la récupération des clients:", error));
    }, []);

    // Récupérer les domaines
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/domaines")
            .then((response) => response.json())
            .then((data) => {
                setDomaines(data.domaines);
            })
            .catch((error) => console.error("Erreur lors de la récupération des domaines:", error));
    }, []);

    // Redirection si l'utilisateur n'est pas un admin
    useEffect(() => {
        if (userRole !== "admin") {
            navigate("/");
        }
    }, [userRole, navigate]);


    
  // Pagination functions
  const paginate = (items, pageNumber, pageSize) => {
    const startIndex = (pageNumber - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const currentItems = paginate(filteredClients, currentPage, itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredClients.length / itemsPerPage); i++) {
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

    // Gestion de la recherche
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = clients.filter(
            (client) =>
                client.nom_entreprise.toLowerCase().includes(term) ||
                client.ville.toLowerCase().includes(term) ||
                client.email_responsable.toLowerCase().includes(term)
        );
        setFilteredClients(filtered);
    };

    // Fonction pour afficher les détails d'un client
    const HandleViewClient = (IdClient) => {
        const client = clients.find(client => client.id === IdClient);
        setIsModalOpen(true);
        setSelectIdClient(client);
        const domainesClient = domaines.filter((domain) => domain.client_id == IdClient);
        setFilteredDomainsClientId(domainesClient);
    };

    const HandleViewFormClient = (clientId) => {
        const clientToEdit = clients.find(client => client.id === clientId);
        if (clientToEdit) {
            setCurrentClient(clientToEdit);
            setNomEntreprise(clientToEdit.nom_entreprise);
            setIce(clientToEdit.ice);
            setVille(clientToEdit.ville);
            setCodePostal(clientToEdit.code_postal);
            setNomResponsable(clientToEdit.nom_responsable);
            setTelResponsable(clientToEdit.tel_responsable);
            setEmailResponsable(clientToEdit.email_responsable);
            setEditModalOpen(true);
        }
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/clients/${currentClient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom_entreprise: nomEntreprise,
                    ice: ice,
                    ville: ville,
                    code_postal: codePostal,
                    nom_responsable: nomResponsable,
                    tel_responsable: telResponsable,
                    email_responsable: emailResponsable
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(data.errors || {});
                }
                throw new Error(data.message || "Erreur lors de la mise à jour du client");
            }

            const updatedClients = clients.map(client =>
                client.id === currentClient.id ? data.client : client
            );

            setClients(updatedClients);
            setFilteredClients(updatedClients);
            setEditModalOpen(false);
            alert("Client mis à jour avec succès");
        } catch (error) {
            console.error("Erreur:", error);
            alert(error.message || "Une erreur est survenue lors de la mise à jour");
        }
    };

    // DELETE UN CLIENT 
    const HandleDelete = async (clientId, e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/clients/${clientId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete client: ${response.statusText}`);
            }

            const fetchResponse = await fetch('http://127.0.0.1:8000/api/clients');
            if (!fetchResponse.ok) {
                throw new Error(`Failed to fetch clients: ${fetchResponse.statusText}`);
            }

            const data = await fetchResponse.json();
            setClients(data.clients);
            setFilteredClients(data.clients);

            alert("Client deleted successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the client: " + error.message);
        }
    };

    // Schéma de validation avec Yup
    const schema = yup.object().shape({
        nomEntreprise: yup.string().required("Company name is required"),
        ice: yup.string().required("L'ICE est requis").matches(/^\d{15}$/, "ICE must contain 15 digits"),
        ville: yup.string().required("City is required"),
        codePostal: yup.string().required("Postal code is required"),
        nomResponsable: yup.string().required("Manager's name is required"),
        telResponsable: yup.string().required("Manager's phone number is required").matches(/^\d{10}$/, "Phone number must contain 10 digits"),
        emailResponsable: yup.string().email("Invalid email").required("Manager's email is required"),
        adresse: yup.string().required("Address is required"),
        password: yup.string().required("Password is required").min(8, "Password must contain at least 8 characters"),
    });

   // Soumission du formulaire
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Validation du formulaire
        await schema.validate(
            {
                nomEntreprise,
                ice,
                ville,
                codePostal,
                nomResponsable,
                telResponsable,
                emailResponsable,
                adresse,
                password,
            },
            { abortEarly: false }
        );

        // Préparation des données
        const formData = {
            nom_entreprise: nomEntreprise,
            ice,
            ville,
            code_postal: codePostal,
            nom_responsable: nomResponsable,
            tel_responsable: telResponsable,
            email_responsable: emailResponsable,
            adresse,
            password,
        };

        // Envoi des données
        const response = await fetch("http://localhost:8000/api/clients", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            // Succès
            alert(`Client ajouté avec succès!\n\nNom: ${nomEntreprise}\nICE: ${ice}`);
            
            // Réinitialisation du formulaire
            setNomEntreprise("");
            setIce("");
            setVille("");
            setCodePostal("");
            setNomResponsable("");
            setTelResponsable("");
            setEmailResponsable("");
            setAdresse("");
            setPassword("");
            setErrors({});

            // Rafraîchissement de la liste des clients
            try {
                const refreshResponse = await fetch("http://localhost:8000/api/clients");
                const refreshData = await refreshResponse.json();
                if (refreshResponse.ok) {
                    setClients(refreshData.clients);
                    setFilteredClients(refreshData.clients);
                } else {
                    console.error("Erreur lors du rafraîchissement:", refreshData.message);
                }
            } catch (refreshError) {
                console.error("Erreur réseau lors du rafraîchissement:", refreshError);
            }
        } else {
            // Erreur serveur
            const errorMsg = result.message || "Erreur inconnue du serveur";
            alert(`Erreur lors de l'ajout du client:\n\n${errorMsg}\n\nCode: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            // Erreur de validation
            const newErrors = {};
            error.inner.forEach((err) => {
                newErrors[err.path] = err.message;
            });
            setErrors(newErrors);
            
            // Alerte pour les erreurs de validation
            const errorMessages = error.inner.map(err => `• ${err.message}`).join('\n');
            alert(`Veuillez corriger les erreurs suivantes:\n\n${errorMessages}`);
        } else {
            // Erreur réseau ou autre
            console.error("Erreur lors de l'envoi:", error);
            alert(`Erreur réseau:\n\n${error.message}\n\nVeuillez réessayer.`);
        }
    } finally {
        // Vous pourriez ajouter ici un indicateur de chargement si nécessaire
    }
};

    // Fonction pour obtenir la couleur du badge en fonction du nombre de domaines
    const getBadgeColor = (count) => {
        if (count === 0) return "danger";     // Rouge pour 0 domaine
        if (count <= 3) return "info";       // Bleu pour 1-3 domaines
        return "success";                    // Vert pour 4 domaines ou plus
    };

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                {/* Table */}
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Clients Management</h3>
                                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                                    <InputGroup className="w-auto">
                                        <Input
                                            type="text"
                                            placeholder="Search clients..."
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
                                        <i className="fas fa-plus mr-2" /> Add New Client
                                    </button>
                                </div>
                            </CardHeader>

                            {showForm && (
    <div className="px-4 py-3">
        <form onSubmit={handleSubmit}>
            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Company Name*</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nomEntreprise}
                            onChange={(e) => setNomEntreprise(e.target.value)}
                        />
                        {errors.nomEntreprise && <small className="text-danger">{errors.nomEntreprise}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>ICE* (15 digits)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={ice}
                            onChange={(e) => setIce(e.target.value)}
                        />
                        {errors.ice && <small className="text-danger">{errors.ice}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Company Address*</label>
                        <input
                            type="text"
                            className="form-control"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                        />
                        {errors.adresse && <small className="text-danger">{errors.adresse}</small>}
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>City*</label>
                        <input
                            type="text"
                            className="form-control"
                            value={ville}
                            onChange={(e) => setVille(e.target.value)}
                        />
                        {errors.ville && <small className="text-danger">{errors.ville}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Postal Code*</label>
                        <input
                            type="text"
                            className="form-control"
                            value={codePostal}
                            onChange={(e) => setCodePostal(e.target.value)}
                        />
                        {errors.codePostal && <small className="text-danger">{errors.codePostal}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Manager Name*</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nomResponsable}
                            onChange={(e) => setNomResponsable(e.target.value)}
                        />
                        {errors.nomResponsable && <small className="text-danger">{errors.nomResponsable}</small>}
                    </div>
                </div>
                
            </div>

            <div className="row mb-3">
                
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Manager Phone*</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={telResponsable}
                            onChange={(e) => setTelResponsable(e.target.value)}
                        />
                        {errors.telResponsable && <small className="text-danger">{errors.telResponsable}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Manager Email*</label>
                        <input
                            type="email"
                            className="form-control"
                            value={emailResponsable}
                            onChange={(e) => setEmailResponsable(e.target.value)}
                        />
                        {errors.emailResponsable && <small className="text-danger">{errors.emailResponsable}</small>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>Password* (min 8 chars)</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <small className="text-danger">{errors.password}</small>}
                    </div>
                </div>
            </div>

           
            <div className="text-right mt-4">
                <button type="submit" className="btn btn-primary px-4">Add Client</button>
            </div>
        </form>
    </div>
)}
                            <Table className="align-items-center table-flush text-center" responsive>
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">Company</th>
                                        <th scope="col">City</th>
                                        <th scope="col">Manager</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Domains</th>
                                        <th scope="col" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((client) => {
                                        const domainCount = domaines.filter(d => d.client_id === client.id).length;
                                        return (
                                            <tr key={client.id}>
                                                <th scope="row">
                                                    <Media className="align-items-center">
                                                        <Media>
                                                            <span className="mb-0 text-sm">
                                                                {client.nom_entreprise}
                                                            </span>
                                                        </Media>
                                                    </Media>
                                                </th>
                                                <td>{client.ville}</td>
                                                <td>{client.nom_responsable}</td>
                                                <td>{client.tel_responsable}</td>
                                                <td>{client.email_responsable}</td>
                                                <td>
                                                    <Badge
                                                        color={getBadgeColor(domainCount)}
                                                        pill
                                                        className="px-3 py-2"
                                                    >
                                                        {domainCount} {domainCount === 1 ? "Domain" : "Domains"}
                                                    </Badge>
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
                                                            
                                                            <DropdownItem
                                                             to={`/admin/client-profile/${client.id}`}
                                                              tag={Link}>
                                                                              <span>View Profile</span>
                                                                            </DropdownItem>
                                                                            <DropdownItem divider />
                                                            <DropdownItem
                                                                href="#pablo"
                                                                onClick={(e) => HandleDelete(client.id, e)}
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </td>
                                            </tr>
                                            
                                        );
                                    })}
                                </tbody>
                            </Table>
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
        </>
    );
};

export default Clients;