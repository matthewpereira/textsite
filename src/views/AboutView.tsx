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
          <p>I am a <strong>Staff Product Designer</strong> focused on balancing risk, platform efficiency, Identity and Security, and customer experience at <strong><a href="https://mercury.com" target="_blank">Mercury</a></strong>, the fintech that ambitious companies use for banking and all their financial workflows.</p>
        </div>
        <div className="about__subtitle">
          <p>I used to design <strong>identity and security</strong> technologies for developers at <strong><a href="https://okta.com" target="_blank">Okta</a></strong> (née <a href="https://auth0.com/" target="_blank">Auth0</a>), and before that <strong>cloud-native software delivery and automation</strong> at <strong><a href="https://vmware.com" target="_blank">VMware</a></strong> (née <a href="https://en.wikipedia.org/wiki/Pivotal_Software" target="_blank">Pivotal Software</a>).</p>
        </div>
        <div className="about__subtitle">
          <p>This website isn't a portfolio, just a place for posting pictures. You can check out <a className="about__aboutLink" href="https://portfolio.matthewpereira.com/">an old product design portfolio</a> or <a className="about__aboutLink" href="https://www.linkedin.com/in/matthewpereira/">contact me on Linkedin</a> if you want to chat about work.</p>
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
