export default function Footer() {
  return (
    <footer className="footer-pichi" id="contacto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Pichi-Gamez</h5>
            <p className="footer-text">
              Tu tienda de videojuegos: encontrá tus títulos favoritos para todas las consolas
              en un solo lugar.
            </p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Contacto</h5>
            <p className="footer-text mb-1">
              <i className="bi bi-envelope-fill me-2"></i>Pichi-Gamez@gmail.com
            </p>
            <p className="footer-text">
              <i className="bi bi-telephone-fill me-2"></i>+54 261 123-4567
            </p>
          </div>
          <div className="col-md-4">
            <h5>Seguinos</h5>
            <a href="#" className="footer-social" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" className="footer-social" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="footer-social" aria-label="Discord">
              <i className="bi bi-discord"></i>
            </a>
          </div>
        </div>
        <hr className="footer-divider" />
        <p className="text-center footer-text mb-0">
          &copy; {new Date().getFullYear()} Pichi-Gamez. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
