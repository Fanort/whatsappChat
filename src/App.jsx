import { useState, useEffect, useRef } from "react";
import { sendMessage, receiveNotification, deleteNotification } from "./api";
import "./App.css";

const App = () => {
  const [idInstance, setIdInstance] = useState(
    () => localStorage.getItem("idInstance") || "",
  );
  const [apiTokenInstance, setApiTokenInstance] = useState(
    () => localStorage.getItem("apiTokenInstance") || "",
  );
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("idInstance", idInstance);
    localStorage.setItem("apiTokenInstance", apiTokenInstance);
  }, [idInstance, apiTokenInstance]);

  const getCureentMessages = async () => {
    while (pollingRef.current) {
      try {
        const notification = await receiveNotification(
          idInstance,
          apiTokenInstance,
        );
        console.log(notification);
        if (notification && notification.body) {
          const body = notification.body;
          if (
            body.typeWebhook === "incomingMessageReceived" &&
            body.messageData?.typeMessage === "textMessage"
          ) {
            const text = body.messageData.textMessageData?.textMessage;
            const sender = body.senderData?.chatId; // или chatId
            console.log(text);
            if (text) {
              setMessages((prev) => [
                ...prev,
                { text, isMine: false, sender, timestamp: Date.now() },
              ]);
            }
          }

          await deleteNotification(
            idInstance,
            apiTokenInstance,
            notification.receiptId,
          );
        }
      } catch (err) {
        console.error("Ошибка получения уведомления:", err);
      }

      await new Promise((r) => setTimeout(r, 3000));
    }
  };

  useEffect(() => {
    if (!idInstance || !apiTokenInstance || !chatId || !isPolling) return;
    pollingRef.current = true;
    getCureentMessages();
    return () => {
      pollingRef.current = false;
    };
  }, [idInstance, apiTokenInstance, chatId, isPolling]);

  const handleCreateChat = () => {
    if (!chatId.trim()) return alert("Введите номер телефона получателя");
    setMessages([]);
    setIsPolling(true);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId) return;
    try {
      const preparedIdChart = `${chatId}@c.us`;
      await sendMessage(
        idInstance,
        apiTokenInstance,
        preparedIdChart,
        inputMessage,
      );
      setMessages((prev) => [
        ...prev,
        { text: inputMessage, isMine: true, timestamp: Date.now() },
      ]);
      setInputMessage("");
    } catch (err) {
      alert("Не удалось отправить сообщение: " + err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      <h1>WhatsApp Чат</h1>

      <div className="credentials">
        <input
          placeholder="Введите idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
        />
        <input
          placeholder="Введите apiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
        />
      </div>

      <div className="new-chat">
        <input
          id="phone"
          placeholder="Номер телефона получателя (в формате 79876543210)"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          maxlength="11"
        />
        <button onClick={handleCreateChat}>Создать чат</button>
      </div>

      {chatId && (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.isMine ? "mine" : "theirs"}`}
              >
                <span>{msg.text}</span>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>

          <div className="input-area">
            <textarea
              placeholder="Введите сообщение..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button onClick={handleSendMessage}>Отправить</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
