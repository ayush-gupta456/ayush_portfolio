import { ArrowUpRight, ArrowUp } from "lucide-react";
import { profile } from "../../data/profile";

const Footer = ({ scrollToSection, navItems }) => (
  <footer className="site-footer"><div className="page-wrap footer-main"><button className="brand" onClick={() => scrollToSection("home")}><span className="brand-mark">A<span>.</span></span><span>Ayush Gupta</span></button><p>Thoughtful software, made with care.</p><div className="footer-socials"><a href={profile.links.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a><a href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a></div><button className="back-top" onClick={() => scrollToSection("home")} aria-label="Back to top"><ArrowUp size={17} /></button></div><div className="page-wrap footer-bottom"><span>© {new Date().getFullYear()} Ayush Gupta</span><span>Designed & built with intention.</span><div>{navItems.slice(0, 4).map((item) => <button key={item.id} onClick={() => scrollToSection(item.id)}>{item.label}</button>)}</div></div></footer>
);

export default Footer;
