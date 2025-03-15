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
          <p>Staff Product Designer focused on balancing risk, platform efficiency, and customer experience at <a href="https://mercury.com" target="_blank">Mercury</a>.</p>
          <p>Formerly designing identity and security for developers <a href="https://okta.com" target="_blank">Okta</a> (née <a href="https://auth0.com/" target="_blank">Auth0</a>), and cloud-native software delivery and automation at <a href="https://vmware.com" target="_blank">VMware</a> (née <a href="https://en.wikipedia.org/wiki/Pivotal_Software" target="_blank">Pivotal Software</a>).</p>
        </div>
        <div className="about__subtitle">
          <a className="about__aboutLink" href="https://portfolio.matthewpereira.com/">View a product design portfolio</a> or <a className="about__aboutLink" href="https://www.linkedin.com/in/matthewpereira/">contact at Linkedin</a>.
        </div>
        <br/><br/><br/>
        <div className="about__subtitle">
          Go <Link to={ '..' }>back to the photos</Link>.
        </div>
      </div>
    </div>
  </div>
</PaginationContextProvider>
);

export default AboutPage;
