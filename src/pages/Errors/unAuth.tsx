import { useNavigate } from "react-router-dom"
import '@/styles/error.scss'

function unAuth() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  }
  return (
    <div className="body min-h-screen">
    <div className="noise"></div>
    <div className="overlay"></div>
    <div className="terminal">
      <h1>Error <span className="errorcode">
          Un Authorized
        </span></h1>
      <p className="output">
        The page your are trying to access is restricted to authorized users only.
       </p>
      <p className="output">Please try to <a onClick={() => handleGoBack} className="cursor-pointer">go back</a> or <a href="#">return to the homepage</a>.</p>
      <p className="output">Good luck.</p>
      <p className="output">_</p>
    </div>
    </div>
  )
}

export default unAuth
