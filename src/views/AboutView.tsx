import { Link } from "react-router-dom";
import Menu from '../components/Menu.tsx';
import { PaginationContextProvider } from '../context/PaginationContext.tsx';

const AboutPage = () => (
  <PaginationContextProvider>
  <div>
    <Menu />
    <div className="about__aboutContainer">
      <div className="about__aboutInner">
        <div className="about__subtitle">
          <p>Principal Product Designer at <a href="https://okta.com" target="_blank">Okta</a> Customer Identity Cloud (née <a href="https://auth0.com" target="_blank">Auth0</a>).</p>
          <p>Formerly at <a href="http://vmware.com" target="_blank">VMware</a> and <a href="https://en.wikipedia.org/wiki/Pivotal_Software" target="_blank">Pivotal Software</a>.</p>
            <p>Firm believer in being kind, doing the right thing, and doing what works.</p>
        </div>
        <div className="about__subtitle">
          <p>Visit an old <a className="about__aboutLink" href="https://portfolio.matthewpereira.com/">product design portfolio</a> or check out <a className="about__aboutLink" href="https://www.linkedin.com/in/matthewpereira/">Linkedin</a>.</p>
        </div>
        <div className="about__subtitle">
          <p><Link to={ '..' }>Return to the photos</Link>.</p>
        </div>
      </div>
    </div>
  </div>
</PaginationContextProvider>
);

export default AboutPage;
