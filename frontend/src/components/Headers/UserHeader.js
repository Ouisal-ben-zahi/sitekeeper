import { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col, Spinner } from "reactstrap";

const Header = () => {
  const [stats, setStats] = useState({
    totalDomains: 0,
    activeDomains: 0,
    expiringDomains: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    domainsExpiringSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des données
        const domainesResponse = await fetch('http://localhost:8000/api/domaines');
        const clientsResponse = await fetch('http://localhost:8000/api/clients');

        if (!domainesResponse.ok || !clientsResponse.ok) {
          throw new Error('Erreur réseau');
        }

        const domainesData = await domainesResponse.json();
        const clientsData = await clientsResponse.json();

        // Vérification de la structure des données
        if (!domainesData.domaines || !clientsData.clients) {
          throw new Error('Structure de données incorrecte');
        }

        // Date actuelle pour les calculs
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        // Calcul des statistiques
        const activeDomains = domainesData.domaines.filter(d => d.statut === 'actif').length;
        const expiringDomains = domainesData.domaines.filter(d => d.statut !== 'actif').length;
        
        nextMonth.setDate(today.getDate() + 30);
        
        const domainsExpiringSoon = domainesData.domaines.filter(d => {
          if (d.statut !== 'actif') return false;
          const expDate = new Date(d.date_expiration);
          return expDate >= today && expDate <= nextMonth;
        }).length;
        

        const newClientsThisMonth = clientsData.clients.filter(c => {
          const createdAt = new Date(c.created_at);
          return createdAt.getMonth() === today.getMonth() && 
                 createdAt.getFullYear() === today.getFullYear();
        }).length;

        setStats({
          totalDomains: domainesData.domaines.length,
          activeDomains,
          expiringDomains,
          totalClients: clientsData.clients.length,
          newClientsThisMonth,
          domainsExpiringSoon
        });

        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <i className="fas fa-exclamation-triangle fa-2x mb-3" />
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        Domaines Actifs
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.activeDomains}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                        <i className="fas fa-globe" />
                      </div>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-nowrap">Sur {stats.totalDomains} total</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        Nouveaux Clients
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.newClientsThisMonth}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i className="fas fa-user-plus" />
                      </div>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-nowrap">Ce mois-ci</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        Domaines Expirant
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.expiringDomains}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-exclamation-triangle" />
                      </div>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-nowrap">Statut "expirant"</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                        Expirent bientôt
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.domainsExpiringSoon}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-orange text-white rounded-circle shadow">
                        <i className="fas fa-clock" />
                      </div>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-muted text-sm">
                    <span className="text-nowrap">Dans 30 jours</span>
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Header;