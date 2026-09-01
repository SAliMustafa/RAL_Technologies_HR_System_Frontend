import { Link } from "react-router";
import "../components/css/NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="error-code">404</div>

        <h1>Page Not Found</h1>

        <p>
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>

        <Link to="/sign-in" className="home-btn">
          Back to sign-in
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;