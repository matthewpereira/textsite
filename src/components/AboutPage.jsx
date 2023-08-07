import React          from 'react';

import styles         from './AboutPage.module.scss';

const AboutPage = () => (
    <div className={styles.aboutContainer}>
        <div className={styles.aboutInner}>
            <div className={styles.headline}>
                Matthew Pereira
            </div>
            <div className={styles.subtitle}>
                Principal Product Designer at <a href="https://okta.com">okta.com</a>. Formerly Sr. Product Design Lead at <a href="http://vmware.com">VMware</a>.
            </div>
            <div className={styles.subtitle}>
                <a className={styles.aboutLink} href="https://portfolio.matthewpereira.com/">Visit Product Design Portfolio</a> &nbsp;&nbsp;or&nbsp;&nbsp; <a className={styles.aboutLink} href="https://www.linkedin.com/in/matthewpereira/">Contact at Linkedin</a>
            </div>
        </div>
    </div>
);

export default AboutPage;
