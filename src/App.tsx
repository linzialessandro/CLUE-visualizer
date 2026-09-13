import './index.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WorkedExample from './components/worked-example/WorkedExample';
import Sandbox from './components/sandbox/Sandbox';

/**
 * CLUE Model Interactive Companion
 *
 * Single-page layout:
 *   1. Header — paper metadata and Baire metric formula
 *   2. Worked Example — interactive replay of Section 3.1
 *   3. Simulation Sandbox — full configurable simulation lab
 *   4. Footer — citation, links, license
 */
export default function App() {
  return (
    <>
      <Header />

      <main className="page">
        {/* Section 1: Worked Example */}
        <section className="section" id="worked-example">
          <div className="section__header">
            <h2 className="section__title">Worked example</h2>
            <p className="section__subtitle">
              Section 3.1 of the paper. Step through the single mutually beneficial
              exchange between two agents and observe convergence to their ideal conceptions.
            </p>
          </div>
          <WorkedExample />
        </section>

        {/* Section 2: Simulation Sandbox */}
        <section className="section" id="sandbox">
          <div className="section__header">
            <h2 className="section__title">Simulation sandbox</h2>
            <p className="section__subtitle">
              Section 3.3 and extensions. Presets reproduce the paper’s multi-round
              illustration; custom communities remain axiom-compatible by construction.
            </p>
          </div>
          <Sandbox />
        </section>
      </main>

      <Footer />
    </>
  );
}
