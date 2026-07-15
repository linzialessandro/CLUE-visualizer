import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="footer__inner">
          <div className="footer__citation">
            <h4 className="footer__heading">Cite this work</h4>
            <p className="footer__text">
              Linzi, A. (2025). A formal model of Cooperative Learning for Understanding
              and Epistemic Progress. <em>SN Social Sciences</em>. Springer.
            </p>
            <p className="footer__text footer__text--mono">
              DOI: [available upon publication]
            </p>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Links</h4>
            <ul className="footer__list">
              <li>
                <a href="https://github.com/linzialessandro/CLUE-visualizer" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="mailto:alessandro.linzi.phd@icloud.com">
                  Contact Author
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__license">
            <h4 className="footer__heading">License</h4>
            <p className="footer__text">
              MIT License © {new Date().getFullYear()} Alessandro Linzi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
