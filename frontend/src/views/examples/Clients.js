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
    const [password, setPassword] = useState("password");
    const [selectIdClient, setSelectIdClient] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [domaines, setDomaines] = useState([]);
    const [filteredDomainsClientId, setFilteredDomainsClientId] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

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
        nomEntreprise: yup.string().required("Le nom de l'entreprise est requis"),
        ice: yup.string().required("L'ICE est requis").matches(/^\d{15}$/, "L'ICE doit contenir 15 chiffres"),
        ville: yup.string().required("La ville est requise"),
        codePostal: yup.string().required("Le code postal est requis"),
        nomResponsable: yup.string().required("Le nom du responsable est requis"),
        telResponsable: yup.string().required("Le téléphone du responsable est requis").matches(/^\d{10}$/, "Le téléphone doit contenir 10 chiffres"),
        emailResponsable: yup.string().email("Email invalide").required("L'email du responsable est requis"),
        adresse: yup.string().required("L'adresse est requise"),
        password: yup.string().required("Le mot de passe est requis").min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    });

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
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

            const response = await fetch("http://localhost:8000/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                setNomEntreprise("");
                setIce("");
                setVille("");
                setCodePostal("");
                setNomResponsable("");
                setTelResponsable("");
                setEmailResponsable("");
                setAdresse("");
                setPassword("password");
                setErrors({});

                fetch("http://127.0.0.1:8000/api/clients")
                    .then((response) => response.json())
                    .then((data) => {
                        setClients(data.clients);
                        setFilteredClients(data.clients);
                    })
                    .catch((error) => console.error("Erreur lors de la récupération des clients:", error));
            } else {
                alert("Erreur lors de l'ajout du client : " + result.message);
            }
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error("Erreur lors de l'envoi du formulaire :", error);
                alert("Une erreur s'est produite lors de l'envoi du formulaire.");
            }
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
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Company Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={nomEntreprise}
                                                        onChange={(e) => setNomEntreprise(e.target.value)}
                                                    />
                                                    {errors.nomEntreprise && <small className="text-danger">{errors.nomEntreprise}</small>}
                                                </div>
                                                <div className="form-group">
                                                    <label>ICE</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={ice}
                                                        onChange={(e) => setIce(e.target.value)}
                                                    />
                                                    {errors.ice && <small className="text-danger">{errors.ice}</small>}
                                                </div>
                                                <div className="form-group">
                                                    <label>City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={ville}
                                                        onChange={(e) => setVille(e.target.value)}
                                                    />
                                                    {errors.ville && <small className="text-danger">{errors.ville}</small>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Postal Code</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={codePostal}
                                                        onChange={(e) => setCodePostal(e.target.value)}
                                                    />
                                                    {errors.codePostal && <small className="text-danger">{errors.codePostal}</small>}
                                                </div>
                                                <div className="form-group">
                                                    <label>Manager Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={nomResponsable}
                                                        onChange={(e) => setNomResponsable(e.target.value)}
                                                    />
                                                    {errors.nomResponsable && <small className="text-danger">{errors.nomResponsable}</small>}
                                                </div>
                                                <div className="form-group">
                                                    <label>Manager Phone</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        value={telResponsable}
                                                        onChange={(e) => setTelResponsable(e.target.value)}
                                                    />
                                                    {errors.telResponsable && <small className="text-danger">{errors.telResponsable}</small>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Company Address</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={adresse}
                                                        onChange={(e) => setAdresse(e.target.value)}
                                                    />
                                                    {errors.adresse && <small className="text-danger">{errors.adresse}</small>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Manager Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={emailResponsable}
                                                        onChange={(e) => setEmailResponsable(e.target.value)}
                                                    />
                                                    {errors.emailResponsable && <small className="text-danger">{errors.emailResponsable}</small>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button type="submit" className="btn btn-primary">Add Client</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <Table className="align-items-center table-flush" responsive>
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
                                    {filteredClients.map((client) => {
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

export default Clients;