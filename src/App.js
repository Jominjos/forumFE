import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Container, Form, Button, Card, ListGroup } from "react-bootstrap";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const socket = io("https://fourm.onrender.com/");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    if (userName.trim() !== "") {
      await socket.emit("register", userName, (response) => {
        if (response.success) {
          setIsRegistered(true);
          setRegistrationError("");
        } else {
          setRegistrationError(response.message);
        }
      });
    } else {
      setRegistrationError("Enter a valid Username");
    }
  };

  useEffect(() => {
    socket.on("message", handleIncomingMessage);
    socket.on("activeUsers", handleActiveUsers);
    socket.on("Allmessages", handleExistingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, []);

  const handleExistingMessage = (items) => {
    setMessages([...items]);
  };

  const handleIncomingMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleActiveUsers = (users) => {
    setActiveUsers(users);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", message);
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Container
      className="vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ background: "#85FFBD" }}
    >
      <h6 className="text-center mt-2">Active Users:</h6>
      <div className="d-flex justify-content-center align-items-center gap-4">
        {activeUsers.length > 0 ? (
          activeUsers.map((user, i) => (
            <Card key={i} bg="success" text="white">
              <Card.Body className="d-flex align-items-center">
                <AccountCircleIcon />
                <Card.Text>{user}</Card.Text>
              </Card.Body>
            </Card>
          ))
        ) : (
          <Card bg="light" text="dark">
            <Card.Body className="d-flex align-items-center">
              <AccountCircleIcon />
              <Card.Text>No Active Users</Card.Text>
            </Card.Body>
          </Card>
        )}
      </div>
      {!isRegistered &&
      (userName !== "" || userName !== null || userName !== undefined) ? (
        <Card className="w-90 mt-2">
          <Card.Body>
            <h5 className="text-center mb-2">Register</h5>
            <Form onSubmit={register}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={userName}
                  placeholder="Username"
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="success" className="w-100">
                Login
              </Button>
              {registrationError && (
                <p className="text-center text-danger mt-3">
                  {registrationError}
                </p>
              )}
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Card className="w-90 mt-2">
          <Card.Body>
            <h5 className="text-center mb-2">FourM</h5>
            <div
              id="messages-container"
              style={{
                flexGrow: 1,
                overflow: "auto",
                marginBottom: "16px",
                backgroundColor: "#D0F0C0",
              }}
            >
              <ListGroup>
                {messages.map((msg, index) => (
                  <ListGroup.Item
                    key={index}
                    className={`d-flex justify-content-${
                      msg.userId === socket.id ? "end" : "start"
                    }`}
                  >
                    <div
                      className="message-text"
                      style={{
                        wordBreak: "break-word",
                        padding: "8px 12px",
                        borderRadius:
                          msg.userId === socket.id
                            ? "10px 0 10px 10px"
                            : "0 10px 10px 10px",
                        backgroundColor:
                          msg.userId === socket.id ? "#F4D03F" : "#FF3CAC",
                        backgroundImage:
                          msg.userId === socket.id
                            ? "linear-gradient(132deg, #F4D03F 0%, #16A085 100%)"
                            : "linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)",
                        color: "white",
                      }}
                    >
                      <div className="message-sender">
                        {msg.userName === userName ? "You" : msg.userName}
                      </div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
            <Form onSubmit={handleSendMessage}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter Message"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">
                Send
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default App;
