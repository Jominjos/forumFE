import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../src/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
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
    <div>
      <h1 className="text-center text-white m-0" id="heading">
        FourM
      </h1>

      <Container
        className=" d-flex flex-column justify-content-center align-items-center"
        style={{ background: "#ffffff" }}
      >
        <h6 className="text-center mt-2  ">Active Users:</h6>
        <div className="d-flex justify-content-center align-items-center gap-4 mb-4">
          {activeUsers.length > 0 ? (
            activeUsers.map((user, i) => (
              <Card key={i} bg="dark" text="white">
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
      </Container>
      <div className="d-flex justify-content-center" id="chat-con1">
        <div className=" m-5 .container-fluid " id="chat-con">
          {!isRegistered &&
          (userName !== "" || userName !== null || userName !== undefined) ? (
            <div>
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
                <Button type="submit" variant="dark" className="w-100">
                  Enter Forum
                </Button>
                {registrationError && (
                  <p className="text-center text-danger mt-3">
                    {registrationError}
                  </p>
                )}
              </Form>
            </div>
          ) : (
            <div>
              <h5 className="text-center mb-2">Chats</h5>
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
                      style={{ border: 0 }}
                    >
                      <div
                        className="message-text"
                        style={{
                          wordBreak: "break-word",
                          padding: "5px 50px 5px 20px",
                          borderRadius:
                            msg.userId === socket.id
                              ? "10px 0 10px 10px"
                              : "0 10px 10px 10px",
                          backgroundColor:
                            msg.userId === socket.id ? "	#1E90FF" : "	#1E90FF",
                          // backgroundImage:
                          //   msg.userId === socket.id
                          //     ? "linear-gradient(132deg, #F4D03F 0%, #16A085 100%)"
                          //     : "linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)",
                          color: "white",
                        }}
                      >
                        <div
                          className="message-sender"
                          style={{ fontSize: "15px", color: "black" }}
                        >
                          {msg.userName === userName ? "You" : msg.userName}
                        </div>
                        <div
                          className="message-content"
                          style={{ fontSize: "20px" }}
                        >
                          {msg.message}
                        </div>
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
                <Button type="submit" variant="dark" className="w-100">
                  Send
                </Button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
