import React from 'react';
import { BlurFade } from './ui/blur-fade';
import { HyperText } from './ui/hyper-text';

const HeroSection = () => {
  return (
    <div
      className="bg-black text-white w-full min-h-screen space-y-28 relative max-w-screen overflow-x-hidden font-sans">
      {/* Main Content */}
      <div className="flex flex-col items-center text-center px-10 z-10 pt-16 pb-10">
        <BlurFade delay={0.5} inView>
          <h1 className="text-7xl font-bold leading-tight font-light">
            Adapta-Test.
          </h1>
        </BlurFade>
        <HyperText
          className="text-1xl font-bold text-white"
          text="Adaptando la forma de aprender"
        />
        <div className="flex flex-col items-start text-center px-10 z-10 pt-10">
          <h2>Nuestros Socios</h2>
        </div>
        {/* Infinite Moving Fading Carousel */}
        <div
          className="w-full max-w-xl mx-auto overflow-hidden relative h-10 mb-20 z-10">
          <div className="flex animate-marquee whitespace-nowrap text-gray-400 text-xl">
            <span className="mx-6">Utp</span>
            <span className="mx-6">Utp</span>
            <span className="mx-6">Utp</span>
          </div>
          {/* Fading gradients */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-purple-900/10 to-transparent"></div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-purple-900/10 to-transparent"></div>
        </div>
      </div>
      {/* Gradient Glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-blue-900/50 via-blue-600/20 to-transparent rounded-t-full opacity-80 blur-3xl"></div>
    </div>
  );
};

export default HeroSection;