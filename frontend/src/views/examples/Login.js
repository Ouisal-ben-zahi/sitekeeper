import { AppContext } from "../../context/AppContext";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
  Alert,
} from "reactstrap";

const Login = () => {
  const navigate = useNavigate();
  const { login, userRole, isLoading: contextLoading } = useContext(AppContext);

  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin/index');
    }
  }, [userRole, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Échec de la connexion");
      }

      if (data.token && data.user) {
        login(data.token, data.user);
        
        // La redirection sera gérée par le useEffect ci-dessus
        // quand userRole sera mis à jour
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage(error.message || "Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Sign in with credentials</small>
          </div>
          
          {errorMessage && (
            <Alert color="danger">
              <span className="alert-inner--text">
                {errorMessage}
              </span>
            </Alert>
          )}
          
          <Form role="form" onSubmit={handleSubmit}>
            <FormGroup className="mb-3">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </InputGroup>
            </FormGroup>
            
            <div className="text-center">
              <Button 
                className="my-4" 
                color="primary" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" />
                    Signing in...
                  </>
                ) : "Sign in"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Login;