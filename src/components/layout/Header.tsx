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
              <p className="header__tagline">Interactive companion</p>
            </div>
          </div>

          <div className="header__meta">
            <div className="header__citation">
              <p className="header__paper-title">
                A formal model of Cooperative Learning for Understanding and Epistemic Progress
              </p>
              <p className="header__author">
                Alessandro Linzi — manuscript submitted to <em>SN Social Sciences</em>
              </p>
            </div>
            <div className="header__formula">
              <MathBlock
                tex="d(x,y)=0\text{ if }x=y;\ \ \tfrac{1}{k+1}\text{ otherwise}"
                display={false}
              />
            </div>
          </div>
        </div>
        <p className="header__note">
          This page illustrates axiom-compatible trajectories of the CLUE model
          (Sections 3.1 and 3.3 of the paper). It is a computational companion,
          not a statistical fit to data; the model has no free parameters.
        </p>
      </div>
    </header>
  );
}
