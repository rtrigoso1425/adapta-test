import { BlurFade } from "../components/ui/blur-fade";
import { HyperText } from "../components/ui/hyper-text";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { motion, useReducedMotion } from "framer-motion";
import { FacebookIcon, FrameIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';
import ModernTeamShowcase from "../components/cybernetic-team-showcase";
import { HoverButton } from "../components/ui/hover-button";
import { LogoCarousel } from "../components/ui/logo-carousel";
import VideoPlayer from "../components/ui/video-player";
import { Text_03 } from '../components/ui/wave-text';

const logos = [
  { 
    id: 'utp-1', 
    img: () => <img src="https://i.postimg.cc/28Gn6t3s/Bolt.png" alt="UTP" className="w-full h-full object-contain" /> 
  },
  { 
    id: 'utp-2', 
    img: () => <img src="https://i.postimg.cc/FHncbJyG/supabase.png" alt="UTP" className="w-full h-full object-contain" /> 
  },
  { 
    id: 'utp-3', 
    img: () => <img src="https://i.postimg.cc/SQW60R4N/Pica.png" alt="UTP" className="w-full h-full object-contain" /> 
  },
  { 
    id: 'utp-4', 
    img: () => <img src="https://i.postimg.cc/L62zmS4k/netlify.png" alt="UTP" className="w-full h-full object-contain" /> 
  },
  { 
    id: 'utp-5', 
    img: () => <img src="https://i.postimg.cc/0yNDJCwb/Eleven-Labs.png" className="w-full h-full object-contain" /> 
  },
  { 
    id: 'utp-6', 
    img: () => <img src="https://i.postimg.cc/VvBnXGgb/21.png" className="w-full h-full object-contain" /> 
  },
];

const teamData = [
    { name: 'Aldair Doloriert', title: 'Backend', avatar: 'https://i.ibb.co/w2wbpg6/2.jpg', socials: { github: 'https://github.com/ezzADJG', linkedin: '#', twitter: '#', instagram: "https://www.instagram.com/aldair.d14" } },
    { name: 'Rodrigo Trigoso', title: 'Frontend', avatar: 'https://i.ibb.co/fzxDpnZ8/1.png', socials: { github: 'https://github.com/rtrigoso1425', linkedin: '#', twitter: '#', instagram: "https://www.instagram.com/rtrigoso1425" } }
];

const footerLinks = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '#features' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'Testimonials', href: '#testimonials' },
      { title: 'Integration', href: '/' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'FAQs', href: '/faqs' },
      { title: 'About Us', href: '/about' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Services', href: '/terms' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Blog', href: '/blog' },
      { title: 'Changelog', href: '/changelog' },
      { title: 'Brand', href: '/brand' },
      { title: 'Help', href: '/help' },
    ],
  },
  {
    label: 'Social Links',
    links: [
      { title: 'Facebook', href: '#', icon: FacebookIcon },
      { title: 'Instagram', href: '#', icon: InstagramIcon },
      { title: 'Youtube', href: '#', icon: YoutubeIcon },
      { title: 'LinkedIn', href: '#', icon: LinkedinIcon },
    ],
  },
];

// Header Component
const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  return (
    <header style={{ 
      padding: '20px', 
      borderBottom: '1px solid #2a2a2aff', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: 'white', 
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Text_03 text='AdaptaTest'/>
        </Link>
      </div>
      <nav>
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0,
          display: 'flex', 
          gap: '20px',
          alignItems: 'center'
        }}>
          {user ? (
            <>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <HoverButton as={Link} to="/dashboard">
                  Dashboard
                </HoverButton>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <HoverButton onClick={onLogout}>
                  Logout
                </HoverButton>
              </li>
            </>
          ) : (
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <HoverButton as={Link} to="/login">
                Login
              </HoverButton>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

// Footer Component
function AnimatedContainer({ className, delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Footer() {
  return (
    <footer
      className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16">
      <div
        className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />
      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <FrameIcon className="size-8" />
          <p className="text-muted-foreground mt-8 text-sm md:mt-0">
            © {new Date().getFullYear()} Adapta Test. All rights reserved.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs">{section.label}</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="hover:text-foreground inline-flex items-center transition-all duration-300">
                        {link.icon && <link.icon className="me-1 size-4" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

// Main HomePage Component
const HomePage = () => {
  return (
    <div className="bg-black text-white w-full min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="bg-black text-white w-full flex-1 space-y-28 relative max-w-screen overflow-x-hidden font-sans">
        <div className="flex flex-col items-center text-center px-10 z-10 pt-16 pb-10">
          <BlurFade delay={0.5} inView>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "30px"}}>
              <img src="https://i.ibb.co/C3m7Fzr2/logo.png" alt="" className="w-1/3 object-cover transition-transform duration-500 group-hover:scale-110"/>
            </div>
          </BlurFade>
          <HyperText
            className="text-1xl font-bold text-white"
            text="Adaptando la forma de aprender"
          />
          <div className="flex flex-col items-center text-center px-10 z-10 pt-10">
            <h2 className="mb-8">Nuestros Socios</h2>
            <div className="w-full max-w-xl mx-auto">
              <LogoCarousel 
                logos={logos} 
                columnCount={4}
              />
            </div>
          </div>
          <ModernTeamShowcase teamMembers={teamData} />
          <VideoPlayer src="https://youtu.be/D8KbXpk2J9Y?si=gBEHFro8ivbxec_S"></VideoPlayer>
        </div>
        {/* Gradient Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/50 via-blue-600/20 to-transparent rounded-t-full opacity-80 blur-3xl"></div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;