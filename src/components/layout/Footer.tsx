import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="footer__inner">
          <div className="footer__citation">
            <h4 className="footer__heading">Cite this work</h4>
            <p className="footer__text">
              Linzi, A. (2026). A formal model of Cooperative Learning for Understanding
              and Epistemic Progress. Manuscript submitted to <em>SN Social Sciences</em>.
            </p>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Links</h4>
            <ul className="footer__list">
              <li>
                <a href="https://github.com/linzialessandro/CLUE-visualizer" target="_blank" rel="noopener noreferrer">
                  Source repository
                </a>
              </li>
              <li>
                <a href="mailto:alessandro.linzi.phd@icloud.com">
                  Correspondence
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
