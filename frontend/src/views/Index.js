/*!
=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
*/
import { useState, useEffect } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  Badge,
} from "reactstrap";
import { chartOptions, parseOptions, chartExample1, chartExample2 } from "variables/charts.js";
import Header from "components/Headers/Header.js";

const Index = () => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  const [clients, setClients] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // Fetch clients data
    fetch("http://localhost:8000/api/clients")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.clients)) {
          setClients(data.clients);
        } else {
          setClients([]);
        }
      })
      .catch(error => {
        setError(error.message);
        setClients([]);
      });

    // Fetch domaines data
    fetch("http://localhost:8000/api/domaines")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.domaines)) {
          setDomaines(data.domaines);
        } else {
          setDomaines([]);
        }
      })
      .catch(error => {
        setError(error.message);
        setDomaines([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  // Function to count domains by status
  const countDomainsByStatus = () => {
    const counts = {
      actifs: 0,
      en_attente: 0,
      expires: 0,
      suspendus: 0
    };

    if (Array.isArray(domaines)) {
      domaines.forEach(domaine => {
        if (domaine.statut === 'actif') counts.actifs++;
        else if (domaine.statut === 'en_attente') counts.en_attente++;
        else if (domaine.statut === 'expire') counts.expires++;
        else if (domaine.statut === 'suspendu') counts.suspendus++;
      });
    }

    return counts;
  };

  const domainStats = countDomainsByStatus();
  const totalDomains = domaines.length;
  
  // Calculate percentages
  const percentages = {
    actifs: totalDomains > 0 ? Math.round((domainStats.actifs / totalDomains) * 100) : 0,
    en_attente: totalDomains > 0 ? Math.round((domainStats.en_attente / totalDomains) * 100) : 0,
    expires: totalDomains > 0 ? Math.round((domainStats.expires / totalDomains) * 100) : 0,
    suspendus: totalDomains > 0 ? Math.round((domainStats.suspendus / totalDomains) * 100) : 0,
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {/* Charts sections remain unchanged */}

        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Liste des clients</h3>
                  </div>
                  <div className="col text-right">
                    
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Entreprise</th>
                    <th scope="col">ICE</th>
                    <th scope="col">Ville</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Téléphone</th>
                    <th scope="col">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.nom_entreprise}</td>
                      <td>{client.ice}</td>
                      <td>{client.ville}</td>
                      <td>{client.nom_responsable}</td>
                      <td>{client.tel_responsable}</td>
                      <td>{client.email_responsable}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;