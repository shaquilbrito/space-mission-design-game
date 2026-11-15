import { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="page"><div className="card auth">
        <h2>Ocorreu um erro</h2>
        <pre style={{ whiteSpace: "pre-wrap", color: "#ff8a8a" }}>{String(this.state.err.stack || this.state.err)}</pre>
        <button className="btn" onClick={() => { localStorage.clear(); location.reload(); }}>Limpar dados e recarregar</button>
      </div></div>
    );
  }
}
createRoot(document.getElementById("root")).render(<Boundary><App /></Boundary>);
