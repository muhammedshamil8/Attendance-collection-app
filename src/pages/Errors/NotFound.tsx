import { useLocation, useNavigate } from "react-router-dom";
import "@/styles/error.scss";

function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="body min-h-screen">
      <div className="noise"></div>
      <div className="overlay"></div>
      <div className="terminal">
        <h1>
          Error <span className="errorcode">404</span>
        </h1>
        {pathname && (
          <p className="output">
            The page <span className="path">{pathname}</span> does not exist
          </p>
        )}
        <p className="output">
          The page you are looking for might have been removed, had its name
          changed or is temporarily unavailable.
        </p>
        <p className="output">
          Please try to{" "}
          <a onClick={handleGoBack} className="cursor-pointer select-none">
            go back
          </a>{" "}
          or{" "}
          <a
            className="cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            return to the homepage
          </a>
          .
        </p>
        <p className="output">Good luck.</p>
        <p className="output">_</p>
      </div>
    </div>
  );
}

export default NotFound;
