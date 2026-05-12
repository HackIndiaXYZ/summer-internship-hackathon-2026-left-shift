'use client'
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GradientCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const GradientCard = ({ title, description, icon }: GradientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setMousePosition({ x, y });
      const rotateX = -(y / rect.height) * 5;
      const rotateY = (x / rect.width) * 5;
      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-[32px] overflow-hidden w-full h-[450px]"
      style={{
        transformStyle: "preserve-3d",
        backgroundColor: "#0e131f",
        boxShadow: "0 -10px 100px 10px rgba(78, 99, 255, 0.15), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(2px)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
          z: 1,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black to-[#050505]" />
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.4) -10%, rgba(79, 70, 229, 0) 70%),
            radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.4) -10%, rgba(79, 70, 229, 0) 70%)
          `,
          filter: "blur(40px)",
        }}
        animate={{
          opacity: isHovered ? 0.9 : 0.7,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] z-25 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          opacity: isHovered ? 1 : 0.5,
        }}
      />
      <div className="relative flex flex-col h-full p-8 z-40">
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-[#171c2c] to-[#121624] border border-white/10"
          animate={{
            z: isHovered ? 20 : 5,
            y: isHovered ? -2 : 0,
          }}
        >
          <div className="text-white">
            {icon}
          </div>
        </motion.div>
        <div className="mb-auto">
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
            {description}
          </p>
          <motion.a
            href="#"
            className="inline-flex items-center text-white text-xs font-bold uppercase tracking-widest group"
          >
            Learn More
            <motion.svg
              className="ml-2 w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ x: isHovered ? 4 : 0 }}
            >
              <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};