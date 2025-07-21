"use client";
import { Heart, Star, Target, User, Users, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const inspirationalContent = [
  {
    quote:
      "Do what you do so well that they will want to see it again and again and bring their friend.",
    author: "Walt Disney",
    icons: [
      {
        icon: User,
        color: "bg-gradient-to-br from-orange-400 to-orange-600",
        position: "top-0 left-1/2 -translate-x-1/2", // Top center
      },
      {
        icon: Users,
        color: "bg-gradient-to-br from-blue-400 to-blue-600",
        position: "bottom-0 left-0", // Bottom left
      },
      {
        icon: Star,
        color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        position: "bottom-0 right-0", // Bottom right
      },
    ],
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    icons: [
      {
        icon: Zap,
        color: "bg-gradient-to-br from-purple-400 to-purple-600",
        position: "top-0 left-1/2 -translate-x-1/2", // Top center
      },
      {
        icon: Target,
        color: "bg-gradient-to-br from-green-400 to-green-600",
        position: "bottom-0 left-0", // Bottom left
      },
      {
        icon: Heart,
        color: "bg-gradient-to-br from-pink-400 to-pink-600",
        position: "bottom-0 right-0", // Bottom right
      },
    ],
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    icons: [
      {
        icon: Star,
        color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
        position: "top-0 left-1/2 -translate-x-1/2", // Top center
      },
      {
        icon: User,
        color: "bg-gradient-to-br from-teal-400 to-teal-600",
        position: "bottom-0 left-0", // Bottom left
      },
      {
        icon: Zap,
        color: "bg-gradient-to-br from-red-400 to-red-600",
        position: "bottom-0 right-0", // Bottom right
      },
    ],
  },
];

export default function WelcomeMessage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides every 8 seconds with smooth transition
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % inspirationalContent.length);
        setIsTransitioning(false);
      }, 500); // Half second fade out, then change content
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 bg-black text-white relative overflow-hidden min-h-[400px] lg:min-h-screen">
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6 z-20">
        <Image src="/asset/sink.png" alt="Logo" width={50} height={50} />
      </div>
      {/* Beautiful Faint Background Patterns */}
      <div className="absolute inset-0 opacity-3">
        {/* Organic Flowing Shapes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
          <defs>
            <radialGradient id="organicGradient1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.02" />
            </radialGradient>
            <radialGradient id="organicGradient2" cx="30%" cy="70%" r="40%">
              <stop offset="0%" stopColor="white" stopOpacity="0.08" />
              <stop offset="100%" stopColor="white" stopOpacity="0.01" />
            </radialGradient>
          </defs>
          {/* Large organic blob shapes */}
          <path
            d="M200,100 Q350,50 500,150 Q650,250 550,400 Q400,500 250,450 Q100,350 200,100"
            fill="url(#organicGradient1)"
          />
          <path
            d="M600,200 Q750,150 700,350 Q650,500 450,480 Q300,460 350,300 Q400,140 600,200"
            fill="url(#organicGradient2)"
          />
          {/* Flowing lines */}
          <path
            d="M0,300 Q200,250 400,300 Q600,350 800,300"
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.05"
          />
          <path
            d="M0,200 Q150,150 300,200 Q450,250 600,200 Q750,150 800,200"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.03"
          />
        </svg>

        {/* Abstract Geometric Patterns */}
        <svg className="absolute top-0 right-0 w-96 h-96" viewBox="0 0 300 300">
          <defs>
            <pattern
              id="hexPattern"
              patternUnits="userSpaceOnUse"
              width="40"
              height="35"
            >
              <polygon
                points="20,5 35,15 35,25 20,35 5,25 5,15"
                stroke="white"
                strokeWidth="0.5"
                fill="none"
                opacity="0.03"
              />
            </pattern>
          </defs>
          <rect width="300" height="300" fill="url(#hexPattern)" />
        </svg>

        {/* Spiral and Circular Patterns */}
        <svg
          className="absolute bottom-0 left-0 w-80 h-80"
          viewBox="0 0 250 250"
        >
          <defs>
            <radialGradient id="spiralGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.06" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Concentric circles */}
          <circle
            cx="125"
            cy="125"
            r="100"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.04"
          />
          <circle
            cx="125"
            cy="125"
            r="80"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.03"
          />
          <circle
            cx="125"
            cy="125"
            r="60"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.05"
          />
          <circle
            cx="125"
            cy="125"
            r="40"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.02"
          />
          {/* Spiral */}
          <path
            d="M125,125 Q145,105 165,125 Q185,145 165,165 Q145,185 125,165 Q105,145 125,125"
            stroke="white"
            strokeWidth="1"
            fill="url(#spiralGradient)"
            opacity="0.04"
          />
        </svg>

        {/* Mesh Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 800">
          <defs>
            <pattern
              id="meshPattern"
              patternUnits="userSpaceOnUse"
              width="50"
              height="50"
            >
              <path
                d="M0,0 L50,0 L50,50 L0,50 Z"
                stroke="white"
                strokeWidth="0.3"
                fill="none"
                opacity="0.02"
              />
            </pattern>
          </defs>
          <rect width="1000" height="800" fill="url(#meshPattern)" />
        </svg>
      </div>

      {/* Faint Wave Elements - Subtle Background */}
      <div className="absolute inset-0 opacity-8">
        {/* Top Wave - Faint */}
        <svg
          className="absolute top-0 left-0 w-full h-24"
          viewBox="0 0 1200 80"
        >
          <defs>
            <linearGradient
              id="topWaveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 Q300,10 600,40 Q900,70 1200,40 L1200,0 L0,0 Z"
            fill="url(#topWaveGradient)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 50,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,25 Q200,55 400,25 Q600,0 800,25 Q1000,50 1200,25"
            stroke="#34d399"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -30,0; 0,0"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Left Side Wave - Faint */}
        <svg className="absolute left-0 top-1/4 w-16 h-64" viewBox="0 0 60 200">
          <defs>
            <linearGradient
              id="leftWaveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 Q30,50 0,100 Q30,150 0,200 L0,0 Z"
            fill="url(#leftWaveGradient)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,15; 0,0"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M15,0 Q45,50 15,100 Q45,150 15,200"
            stroke="#2dd4bf"
            strokeWidth="1"
            fill="none"
            opacity="0.15"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-10; 0,0"
              dur="9s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Right Side Wave - Faint */}
        <svg
          className="absolute right-0 top-1/3 w-16 h-64"
          viewBox="0 0 60 200"
        >
          <defs>
            <linearGradient
              id="rightWaveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <path
            d="M60,0 Q30,50 60,100 Q30,150 60,200 L60,0 Z"
            fill="url(#rightWaveGradient)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-15; 0,0"
              dur="11s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M45,0 Q15,50 45,100 Q15,150 45,200"
            stroke="#10b981"
            strokeWidth="1"
            fill="none"
            opacity="0.15"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,10; 0,0"
              dur="7s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Center Diagonal Waves - Faint */}
        <svg
          className="absolute top-1/2 left-1/4 w-64 h-16 transform -translate-y-1/2"
          viewBox="0 0 200 50"
        >
          <path
            d="M0,25 Q50,10 100,25 Q150,40 200,25"
            stroke="#16a34a"
            strokeWidth="1"
            fill="none"
            opacity="0.12"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 15,0; 0,0"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,15 Q50,35 100,15 Q150,0 200,15"
            stroke="#4ade80"
            strokeWidth="1"
            fill="none"
            opacity="0.08"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -10,0; 0,0"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Additional Faint Flowing Green Elements */}
        <svg
          className="absolute top-1/4 right-1/4 w-32 h-32"
          viewBox="0 0 100 100"
        >
          <defs>
            <radialGradient id="greenRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#greenRadial)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50; 360 50 50"
              dur="20s"
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M50,10 Q70,30 50,50 Q30,70 50,90"
            stroke="#059669"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50; -360 50 50"
              dur="25s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* DOMINANT BOTTOM WAVES - Highly Visible and Bigger - Starting from extreme bottom */}
      <div className="absolute bottom-0 left-0 w-full opacity-50">
        {/* Main Bottom Wave - Very Prominent and Bigger - No bottom space */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="bottomWaveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.6" />
              <stop offset="25%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#059669" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient
              id="bottomWaveGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient
              id="bottomWaveGradient3"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Primary Bottom Wave Layer - More spaced */}
          <path
            d="M0,60 Q300,120 600,60 Q900,0 1200,60 L1200,200 L0,200 Z"
            fill="url(#bottomWaveGradient)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -40,0; 0,0"
              dur="14s"
              repeatCount="indefinite"
            />
          </path>

          {/* Secondary Bottom Wave Layer - Better spacing */}
          <path
            d="M0,100 Q200,160 400,100 Q600,180 800,100 Q1000,140 1200,100 L1200,200 L0,200 Z"
            fill="url(#bottomWaveGradient2)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 30,0; 0,0"
              dur="16s"
              repeatCount="indefinite"
            />
          </path>

          {/* Third Bottom Wave Layer - Even more spacing */}
          <path
            d="M0,140 Q150,180 300,140 Q450,200 600,140 Q750,180 900,140 Q1050,200 1200,140 L1200,200 L0,200 Z"
            fill="url(#bottomWaveGradient3)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -25,0; 0,0"
              dur="18s"
              repeatCount="indefinite"
            />
          </path>

          {/* Bottom Wave Stroke Lines - Better spaced */}
          <path
            d="M0,80 Q200,25 400,80 Q600,120 800,80 Q1000,40 1200,80"
            stroke="#22c55e"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 25,0; 0,0"
              dur="13s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,120 Q300,70 600,120 Q900,170 1200,120"
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -20,0; 0,0"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,40 Q150,10 300,40 Q450,80 600,40 Q750,10 900,40 Q1050,80 1200,40"
            stroke="#34d399"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 35,0; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Main Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 w-full h-1/2">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <path
              d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M0,120 Q100,70 200,120 T400,120 L400,200 L0,200 Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M0,140 Q100,90 200,140 T400,140 L400,200 L0,200 Z"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>
        </div>
      </div>

      {/* Enhanced Pulse Elements - Much More Visible */}
      <div className="absolute inset-0 opacity-25">
        {/* Extra Large Pulses */}
        <div
          className="absolute top-12 left-12 w-48 h-48 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4s", animationDelay: "0s" }}
        ></div>
        <div
          className="absolute bottom-16 right-16 w-56 h-56 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/4 right-8 w-40 h-40 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.5s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-44 h-44 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4.5s", animationDelay: "0.8s" }}
        ></div>

        {/* Large Pulses */}
        <div
          className="absolute top-1/3 left-4 w-32 h-32 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4.5s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-16 right-1/3 w-28 h-28 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4s", animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-2/3 w-32 h-32 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.8s", animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute top-2/3 right-12 w-24 h-24 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4.2s", animationDelay: "2.8s" }}
        ></div>

        {/* Medium Pulses */}
        <div
          className="absolute top-1/2 left-8 w-20 h-20 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4.5s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-20 right-1/4 w-18 h-18 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.2s", animationDelay: "1.8s" }}
        ></div>
        <div
          className="absolute bottom-32 right-1/3 w-16 h-16 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.5s", animationDelay: "2.2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/4 w-22 h-22 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4.8s", animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute bottom-1/2 right-1/4 w-20 h-20 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.6s", animationDelay: "1.9s" }}
        ></div>

        {/* Small Pulses */}
        <div
          className="absolute top-40 left-1/3 w-12 h-12 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "0.8s" }}
        ></div>
        <div
          className="absolute bottom-40 right-1/4 w-14 h-14 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.5s", animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute top-2/3 left-20 w-10 h-10 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "4s", animationDelay: "1.8s" }}
        ></div>
        <div
          className="absolute top-1/4 left-2/3 w-8 h-8 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "2.8s", animationDelay: "2.4s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-2/3 w-12 h-12 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.4s", animationDelay: "0.6s" }}
        ></div>

        {/* Tiny Pulses */}
        <div
          className="absolute top-32 left-2/3 w-6 h-6 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/2 w-8 h-8 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.2s", animationDelay: "1.7s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/3 w-4 h-4 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "2.8s", animationDelay: "2.2s" }}
        ></div>
        <div
          className="absolute top-1/6 left-1/2 w-6 h-6 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.1s", animationDelay: "1.4s" }}
        ></div>
        <div
          className="absolute bottom-1/6 right-1/2 w-5 h-5 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "2.9s", animationDelay: "2.6s" }}
        ></div>
        <div
          className="absolute top-1/2 right-2/3 w-7 h-7 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "3.3s", animationDelay: "0.9s" }}
        ></div>
        <div
          className="absolute bottom-2/3 left-1/6 w-4 h-4 bg-white rounded-full animate-pulse"
          style={{ animationDuration: "2.7s", animationDelay: "2.1s" }}
        ></div>
      </div>

      {/* Content - Perfectly Centered with Smooth Transitions */}
      <div className="relative z-10 h-full flex items-center justify-center p-8 lg:p-12">
        <div
          className={`max-w-md text-center transition-all duration-1000 ease-in-out ${
            isTransitioning
              ? "opacity-0 transform translate-y-4"
              : "opacity-100 transform translate-y-0"
          }`}
        >
          {/* Quote with properly positioned quote marks */}
          <div className="relative mb-8">
            <svg
              className="absolute -top-2 -left-8 w-8 h-8 text-white opacity-40"
              viewBox="0 0 24 24"
            >
              <path
                d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"
                fill="currentColor"
              />
            </svg>
            <blockquote className="text-xl lg:text-2xl leading-relaxed font-light">
              {inspirationalContent[currentSlide].quote}
            </blockquote>
            <svg
              className="absolute -bottom-2 -right-8 w-8 h-8 text-white opacity-40 transform rotate-180"
              viewBox="0 0 24 24"
            >
              <path
                d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Author with enhanced styling */}
          <div className="flex items-center justify-center mb-12 relative">
            <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1 mr-4 max-w-16"></div>
            <cite className="text-lg font-medium not-italic px-4 relative">
              {inspirationalContent[currentSlide].author}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-px bg-white opacity-50"></div>
            </cite>
            <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent flex-1 ml-4 max-w-16"></div>
          </div>

          {/* Icon Avatars in Triangle Formation with decorative elements */}
          <div className="relative flex items-center justify-center h-40">
            {/* Decorative triangle outline */}
            <svg className="absolute w-52 h-36" viewBox="0 0 200 140">
              <path
                d="M100,10 L170,120 L30,120 Z"
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.1"
              />
              <path
                d="M100,20 L160,110 L40,110 Z"
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.05"
              />
            </svg>
            <div className="relative w-48 h-32">
              {inspirationalContent[currentSlide].icons.map(
                (iconData, index) => {
                  const Icon = iconData.icon;
                  return (
                    <div
                      key={index}
                      className={`absolute w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-1000 ease-in-out ${iconData.color} ${iconData.position} ring-2 ring-white ring-opacity-20`}
                    >
                      <Icon className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
