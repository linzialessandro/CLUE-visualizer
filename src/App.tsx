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
            <h2 className="section__title">Worked Example</h2>
            <p className="section__subtitle">
              Paper §3.1 — Step through the exchange between two agents
              and observe convergence to their ideal conceptions.
            </p>
          </div>
          <WorkedExample />
        </section>

        {/* Section 2: Simulation Sandbox */}
        <section className="section" id="sandbox">
          <div className="section__header">
            <h2 className="section__title">Simulation Sandbox</h2>
            <p className="section__subtitle">
              Explore convergence dynamics with configurable scenarios.
              Select a preset or generate custom communities.
            </p>
          </div>
          <Sandbox />
        </section>
      </main>

      <Footer />
    </>
  );
}
