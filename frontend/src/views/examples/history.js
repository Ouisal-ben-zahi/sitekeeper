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
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);

   
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
  // Pagination functions
  const paginate = (items, pageNumber, pageSize) => {
    const startIndex = (pageNumber - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  };

  const currentItems = paginate(filteredHistory, currentPage, itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredHistory.length / itemsPerPage); i++) {
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


  // Fetch history
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/history")
      .then((response) => response.json())
      .then((data) => {
        // Filter only creation and status_change actions
        const filteredData = data.history.filter(item => 
          item.action === 'creation' || item.action === 'status_change'
        );
        
        setHistory(filteredData);
        setFilteredHistory(filteredData);
        
        // Extract unique domains from history
        const uniqueDomains = filteredData.reduce((acc, item) => {
          if (!acc.some(d => d.id === item.domaine.id)) {
            acc.push(item.domaine);
          }
          return acc;
        }, []);
        setDomains(uniqueDomains);
      })
      .catch((error) => console.error("Error fetching history:", error));
  }, []);

  // Redirect if user is not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  // Handle search
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

  // Filter by domain
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get badge color based on action
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
                <h3 className="mb-0">Domains History</h3>
                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                  <InputGroup className="w-auto">
                    <Input
                      type="text"
                      placeholder="Search..."
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
                      {selectedDomain ? domains.find(d => d.id === selectedDomain)?.nom_domaine : 'All domains'}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => filterByDomain('all')}>All domains</DropdownItem>
                      <DropdownItem divider />
                      {domains.map(domain => (
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
                    <th scope="col">Domain</th>
                    <th scope="col">Action</th>
                    <th scope="col">Old Status</th>
                    <th scope="col">New Status</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
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

export default History;