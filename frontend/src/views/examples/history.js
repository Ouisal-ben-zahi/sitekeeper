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
  import Header from "components/Headers/Header.js";
  import React, { useState, useEffect, useContext } from "react";
  import { AppContext } from "../../context/AppContext";
  import { Link, useNavigate } from "react-router-dom";
  
  const History = () => {
    const { userRole } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [domaines, setDomaines] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);
  
    // Récupérer l'historique
    useEffect(() => {
      fetch("http://127.0.0.1:8000/api/history")
        .then((response) => response.json())
        .then((data) => {
          setHistory(data.history);
          setFilteredHistory(data.history);
          // Extraire les domaines uniques depuis l'historique
          const uniqueDomains = data.history.reduce((acc, item) => {
            if (!acc.some(d => d.id === item.domaine.id)) {
              acc.push(item.domaine);
            }
            return acc;
          }, []);
          setDomaines(uniqueDomains);
        })
        .catch((error) => console.error("Erreur lors de la récupération de l'historique:", error));
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
      const filtered = history.filter(
        (item) =>
          item.action.toLowerCase().includes(term) ||
          (item.old_value && item.old_value.toLowerCase().includes(term)) ||
          (item.new_value && item.new_value.toLowerCase().includes(term)) ||
          (item.domaine.nom_domaine.toLowerCase().includes(term))
      );
      setFilteredHistory(filtered);
    };
  
    // Filtrer par domaine
    const filterByDomain = (domainId) => {
      if (domainId === "all") {
        setFilteredHistory(history);
        setSelectedDomain(null);
      } else {
        const filtered = history.filter(item => item.domaine_id == domainId);
        setFilteredHistory(filtered);
        setSelectedDomain(domainId);
      }
    };
  
    // Formater la date
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };
  
    // Obtenir la couleur du badge selon l'action
    const getActionBadgeColor = (action) => {
      switch (action) {
        case 'creation': return 'success';
        case 'status_change': return 'info';
        case 'system_status_change': return 'primary';
        case 'deletion': return 'danger';
        default: return 'warning';
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
                  <h3 className="mb-0">Historique des Domaines</h3>
                  <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                    <InputGroup className="w-auto">
                      <Input
                        type="text"
                        placeholder="Rechercher..."
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
                    <UncontrolledDropdown>
                      <DropdownToggle caret color="secondary">
                        {selectedDomain ? domaines.find(d => d.id === selectedDomain)?.nom_domaine : 'Tous les domaines'}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => filterByDomain('all')}>Tous les domaines</DropdownItem>
                        <DropdownItem divider />
                        {domaines.map(domain => (
                          <DropdownItem key={domain.id} onClick={() => filterByDomain(domain.id)}>
                            {domain.nom_domaine}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
                </CardHeader>
  
                <Table className="align-items-center table-flush text-center" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Domaine</th>
                      <th scope="col">Action</th>
                      <th scope="col">Ancienne Valeur</th>
                      <th scope="col">Nouvelle Valeur</th>
                      <th scope="col">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.id}>
                        <th scope="row">
                          <Link to={`/admin/domain-profile/${item.domaine_id}`}>
                            {item.domaine.nom_domaine}
                          </Link>
                        </th>
                        <td>
                          <Badge color={getActionBadgeColor(item.action)} className="text-uppercase">
                            {item.action.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>{item.old_value || '-'}</td>
                        <td>{item.new_value || '-'}</td>
                        <td>{formatDate(item.created_at)}</td>
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
  
  export default History;