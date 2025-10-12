import { BlurFade } from "../components/ui/blur-fade";
import { HyperText } from "../components/ui/hyper-text";
import React, { useState, useEffect } from 'react';
import { Sun, Moon, AlignCenter } from 'lucide-react';
import ModernTeamShowcase from "../components/cybernetic-team-showcase";
import { HoverButton } from "../components/ui/hover-button";
import { LogoCarousel } from "../components/ui/logo-carousel";
import VideoPlayer from "../components/ui/video-player";

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
const HomePage = () => {
  return (
      <div
        className="bg-black text-white w-full min-h-screen space-y-28 relative max-w-screen overflow-x-hidden font-sans">
        {/* Main Content */}
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
          <VideoPlayer src="/el-real-video-xd_s6lXFqi9.mp4"></VideoPlayer>
        </div>
        {/* Gradient Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/50 via-blue-600/20 to-transparent rounded-t-full opacity-80 blur-3xl"></div>
      </div>
    );
};
export default HomePage;