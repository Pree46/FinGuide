export const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#e0f2fe",
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    padding: "15px 20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    objectFit: "contain",
    backgroundColor: "#fff",
    padding: "4px",
  },

  headerTitle: { fontSize: "1.5rem", fontWeight: "700", margin: 0 },
  headerSubtitle: { fontSize: "0.9rem", opacity: 0.85, marginTop: "2px" },

  chatContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  messageBubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: "20px",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    wordWrap: "break-word",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },

  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1e3a8a",
    borderBottomLeftRadius: "4px",
  },

  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#f1f5f9",
    borderTop: "1px solid #cbd5e1",
    gap: "8px",
  },

  textInput: {
    flex: 1,
    border: "none",
    borderRadius: "20px",
    padding: "10px 15px",
    fontSize: "1rem",
    resize: "none",
    backgroundColor: "#fff",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    outline: "none",
  },

  sendButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    fontSize: "1.2rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(37,99,235,0.4)",
    transition: "0.3s",
  },

  loading: {
    alignSelf: "center",
    color: "#1e3a8a",
    fontWeight: "500",
  },
};
