"use client";
import React, { useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

// A utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- CODE ORGANIZATION ---
const iconMap = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    instagram: Instagram,
};

const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: (i) => ({
        y: 0,
        opacity: 1,
        transition: { type: "spring", bounce: 0.4, duration: 0.8, delay: i * 0.15 }
    })
};

// --- PERFORMANCE & REUSABILITY ---
const TeamMemberCard = React.memo(({
    member,
    index
}) => {
    // --- MOTION HANDLER OPTIMIZATION ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30, bounce: 0.2 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30, bounce: 0.2 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    return (
        <motion.div
            variants={cardVariants}
            custom={index}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative aspect-[3/4] w-full max-w-xs mx-auto rounded-xl bg-gray-900/25 shadow-2xl">
            <div
                style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
                className="absolute inset-3 flex flex-col items-center text-center bg-gray-800/10 backdrop-blur-md p-4 rounded-lg border border-gray-700">
                <div
                    className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-slate-600 mb-3">
                    <img
                        src={member.avatar}
                        alt={`Portrait of ${member.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src='https://placehold.co/400x400/cccccc/ffffff?text=??'; }} />
                    <div
                        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-blue-400">{member.title}</p>
                
                <div className="flex items-center space-x-4 mt-auto">
                    {Object.entries(member.socials).map(([key, link], i) => {
                        const Icon = iconMap[key];
                        return (
                            <a
                                key={key}
                                href={link}
                                aria-label={`${member.name}'s ${key}`}
                                className="text-gray-400 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                                style={{ transitionDelay: `${i * 100}ms` }}>
                                <Icon />
                            </a>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
});

// The main team showcase component, now accepting team data as a prop
const ModernTeamShowcase = ({ teamMembers = [], tagline }) => {
    return (
        <div className="relative w-full flex flex-col items-center justify-center p-8">
            <div className="relative z-10 flex flex-col items-center text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
                    className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
                    Conoce a los desarrolladores
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
                    className="text-base text-gray-400 max-w-2xl">
                    {tagline || "Las personas que hicieron posible adaptar tu aprendizaje"}
                </motion.p>
            </div>
            
            <div className="relative z-10 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                    <TeamMemberCard key={member.name} member={member} index={index} />
                ))}
            </div>
        </div>
    );
};

export default ModernTeamShowcase;