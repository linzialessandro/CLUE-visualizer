import MathBlock from '../shared/MathBlock';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="page">
        <div className="header__inner">
          <div className="header__brand">
            <div className="header__logo" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
                <circle cx="10" cy="16" r="6" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="22" cy="16" r="6" stroke="var(--color-match)" strokeWidth="2" />
                <path d="M14.5 13 L17.5 19 M14.5 19 L17.5 13" stroke="var(--color-exchange)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="header__title">CLUE Model</h1>
              <p className="header__tagline">Interactive Companion</p>
            </div>
          </div>

          <div className="header__meta">
            <div className="header__citation">
              <p className="header__paper-title">
                A formal model of Cooperative Learning for Understanding and Epistemic Progress
              </p>
              <p className="header__author">
                Alessandro Linzi — <em>SN Social Sciences</em> (Springer)
              </p>
              <p className="header__doi">
                DOI: <a href="#" className="header__doi-link">[available upon publication]</a>
              </p>
            </div>
            <div className="header__formula">
              <MathBlock
                tex="d(x, y) = \frac{1}{\min\{n \in \mathbb{N} \mid x_n \neq y_n\} + 1}"
                display={false}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
